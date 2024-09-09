import { ref, snapshot, subscribe } from "@zag-js/store"
import {
  cast,
  clear,
  compact,
  hasProp,
  invariant,
  isArray,
  isDev,
  isObject,
  isString,
  noop,
  runIfFn,
  uuid,
  warn,
} from "@zag-js/utils"
import { createProxy } from "./create-proxy"
import { deepMerge } from "./deep-merge"
import { determineDelayFn } from "./delay-utils"
import { determineActionsFn, determineGuardFn } from "./guard-utils"
import { determineTransitionFn } from "./transition-utils"
import {
  ActionTypes,
  MachineStatus,
  MachineType,
  type Dict,
  type StateMachine as S,
  type VoidFunction,
  type Writable,
} from "./types"
import { structuredClone, toArray, toEvent } from "./utils"

export class Machine<
  TContext extends Dict,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
> {
  public status: MachineStatus = MachineStatus.NotStarted
  public readonly state: S.State<TContext, TState, TEvent>

  public initialState: S.StateInfo<TContext, TState, TEvent> | undefined
  public initialContext: TContext

  public id: string

  public type: MachineType = MachineType.Machine

  // Cleanup function map (per state)
  private activityEvents = new Map<string, Map<string, VoidFunction>>()
  private delayedEvents = new Map<string, VoidFunction[]>()

  // state update listeners the user can opt-in for
  private stateListeners = new Set<S.StateListener<TContext, TState, TEvent>>()
  private doneListeners = new Set<S.StateListener<TContext, TState, TEvent>>()
  private contextWatchers = new Set<VoidFunction>()

  // Cleanup functions (for `subscribe`)
  private removeStateListener: VoidFunction = noop

  // For Parent <==> Spawned Actor relationship
  private parent?: AnyMachine
  private children = new Map<string, AnyMachine>()

  // A map of guard, action, delay implementations
  private guardMap: S.GuardMap<TContext, TState, TEvent>
  private actionMap: S.ActionMap<TContext, TState, TEvent>
  private delayMap: S.DelayMap<TContext, TEvent>
  private activityMap: S.ActivityMap<TContext, TState, TEvent>
  private sync: boolean
  public options: S.MachineOptions<TContext, TState, TEvent>
  public config: S.MachineConfig<TContext, TState, TEvent>

  // Let's get started!
  constructor(config: S.MachineConfig<TContext, TState, TEvent>, options?: S.MachineOptions<TContext, TState, TEvent>) {
    // clone the config and options
    this.config = structuredClone(config)
    this.options = structuredClone(options ?? {})

    this.id = this.config.id ?? `machine-${uuid()}`

    // maps
    this.guardMap = this.options?.guards ?? {}
    this.actionMap = this.options?.actions ?? {}
    this.delayMap = this.options?.delays ?? {}
    this.activityMap = this.options?.activities ?? {}
    this.sync = this.options?.sync ?? false

    // create mutatable state
    this.state = createProxy(this.config)

    this.initialContext = snapshot(this.state.context)
  }

  // immutable state value
  private get stateSnapshot(): S.State<TContext, TState, TEvent> {
    return cast(snapshot(this.state))
  }

  public getState(): S.State<TContext, TState, TEvent> {
    return this.stateSnapshot
  }

  // immutable context value
  public get contextSnapshot(): TContext {
    return this.stateSnapshot.context
  }

  public _created = () => {
    // created actions
    const event = toEvent<TEvent>(ActionTypes.Created)
    this.executeActions(this.config?.created, event)
  }

  // Starts the interpreted machine.
  public start = (init?: S.StateInit<TContext, TState>) => {
    // reset state back to empty (for SSR, we had to set state.value to initial value)
    this.state.value = ""
    this.state.tags = []

    // Don't start if it's already running
    if (this.status === MachineStatus.Running) {
      return this
    }

    this.status = MachineStatus.Running

    // subscribe to state changes
    this.removeStateListener = subscribe(
      this.state,
      () => {
        this.stateListeners.forEach((listener) => {
          listener(this.stateSnapshot)
        })
      },
      this.sync,
    )

    this.setupContextWatchers()

    // execute initial actions and activities
    this.executeActivities(toEvent<TEvent>(ActionTypes.Start), toArray(this.config.activities), ActionTypes.Start)
    this.executeActions(this.config.entry, toEvent<TEvent>(ActionTypes.Start))

    // start transition
    const event = toEvent<TEvent>(ActionTypes.Init)

    const target = isObject(init) ? init.value : init
    const context = isObject(init) ? init.context : undefined

    if (context) {
      this.setContext(context as Partial<TContext>)
    }

    // start transition definition
    const transition = {
      target: target ?? this.config.initial,
    }

    const next = this.getNextStateInfo(transition, event)
    this.initialState = next

    this.performStateChangeEffects(this.state.value!, next, event)

    return this
  }

  private setupContextWatchers = () => {
    const { watch } = this.config
    if (!watch) return

    let prev = snapshot(this.state.context)

    const cleanup = subscribe(this.state.context, () => {
      const next = snapshot(this.state.context)

      for (const [key, fn] of Object.entries(watch)) {
        const isEqual = this.options.compareFns?.[key] ?? Object.is
        if (isEqual(prev[key], next[key])) continue
        this.executeActions(fn, this.state.event as TEvent)
      }

      prev = next
    })

    this.contextWatchers.add(cleanup)
  }

  // Stops the interpreted machine
  stop = () => {
    // No need to call if already stopped
    if (this.status === MachineStatus.Stopped) return

    // exit current state
    this.performExitEffects(this.state.value!, toEvent<TEvent>(ActionTypes.Stop))

    // execute root stop or exit actions
    this.executeActions(this.config.exit, toEvent<TEvent>(ActionTypes.Stop))

    this.setState("")
    this.setEvent(ActionTypes.Stop)

    // cleanups
    this.stopStateListeners()
    this.stopChildren()
    this.stopActivities()
    this.stopDelayedEvents()
    this.stopContextWatchers()

    this.status = MachineStatus.Stopped
    return this
  }

  private stopStateListeners = () => {
    this.removeStateListener()
    this.stateListeners.clear()
  }

  private stopContextWatchers = () => {
    this.contextWatchers.forEach((fn) => fn())
    this.contextWatchers.clear()
  }

  private stopDelayedEvents = () => {
    this.delayedEvents.forEach((state) => {
      state.forEach((stop) => stop())
    })
    this.delayedEvents.clear()
  }

  // Cleanup running activities (e.g `setInterval`, invoked callbacks, promises)
  private stopActivities = (state?: TState["value"]) => {
    // stop activities for a state
    if (state) {
      this.activityEvents.get(state)?.forEach((stop) => stop())
      this.activityEvents.get(state)?.clear()
      this.activityEvents.delete(state)
    } else {
      // stop every running activity
      this.activityEvents.forEach((state) => {
        state.forEach((stop) => stop())
        state.clear()
      })
      this.activityEvents.clear()
    }
  }

  /**
   * Function to send event to spawned child machine or actor
   */
  public sendChild = (evt: S.Event<S.AnyEventObject>, to: string | ((ctx: TContext) => string)) => {
    const event = toEvent(evt)
    const id = runIfFn(to, this.contextSnapshot)
    const child = this.children.get(id)
    if (!child) {
      invariant(`[@zag-js/core] Cannot send '${event.type}' event to unknown child`)
    }
    child!.send(event)
  }

  /**
   * Function to stop a running child machine or actor
   */
  public stopChild = (id: string) => {
    if (!this.children.has(id)) {
      invariant(`[@zag-js/core > stop-child] Cannot stop unknown child ${id}`)
    }
    this.children.get(id)!.stop()
    this.children.delete(id)
  }

  public removeChild = (id: string) => {
    this.children.delete(id)
  }

  // Stop and delete spawned actors
  private stopChildren = () => {
    this.children.forEach((child) => child.stop())
    this.children.clear()
  }

  private setParent = (parent: any) => {
    this.parent = parent
  }

  public spawn = <TContext extends Dict, TState extends S.StateSchema, TEvent extends S.EventObject = S.AnyEventObject>(
    src: MachineSrc<TContext, TState, TEvent>,
    id?: string,
  ) => {
    const actor = runIfFn(src)
    if (id) actor.id = id
    actor.type = MachineType.Actor
    actor.setParent(this)
    this.children.set(actor.id, cast(actor))

    actor
      .onDone(() => {
        this.removeChild(actor.id)
      })
      .start()

    return cast<typeof actor>(ref(actor))
  }

  private stopActivity = (key: string) => {
    if (!this.state.value) return
    const cleanups = this.activityEvents.get(this.state.value)
    cleanups?.get(key)?.() // cleanup
    cleanups?.delete(key) // remove from map
  }

  private addActivityCleanup = (state: TState["value"] | null, key: string, cleanup: VoidFunction) => {
    if (!state) return
    if (!this.activityEvents.has(state)) {
      this.activityEvents.set(state, new Map([[key, cleanup]]))
    } else {
      this.activityEvents.get(state)?.set(key, cleanup)
    }
  }

  private setState = (target: TState["value"] | null) => {
    this.state.previousValue = this.state.value
    this.state.value = target

    const stateNode = this.getStateNode(target)

    if (target == null) {
      // remove all tags
      clear(this.state.tags)
    } else {
      this.state.tags = toArray(stateNode?.tags)
    }
  }

  /**
   * To used within side effects for React or Vue to update context
   */
  public setContext = (context: Partial<Writable<TContext>> | undefined) => {
    if (!context) return
    deepMerge(this.state.context, compact(context))
  }

  public setOptions = (options: Partial<S.MachineOptions<TContext, TState, TEvent>>) => {
    const opts = compact(options)
    this.actionMap = { ...this.actionMap, ...opts.actions }
    this.delayMap = { ...this.delayMap, ...opts.delays }
    this.activityMap = { ...this.activityMap, ...opts.activities }
    this.guardMap = { ...this.guardMap, ...opts.guards }
  }

  private getStateNode = (state: TState["value"] | null) => {
    if (!state) return
    return this.config.states?.[state]
  }

  private getNextStateInfo = (
    transitions: S.Transitions<TContext, TState, TEvent>,
    event: TEvent,
  ): S.StateInfo<TContext, TState, TEvent> => {
    // pick transition
    const transition = this.determineTransition(transitions, event)

    const isTargetless = !transition?.target
    const target = transition?.target ?? this.state.value
    const changed = this.state.value !== target

    const stateNode = this.getStateNode(target)
    const reenter = !isTargetless && !changed && !transition?.internal

    const info = {
      reenter,
      transition,
      stateNode,
      target: target!,
      changed,
    }

    this.log("NextState:", `[${event.type}]`, this.state.value, "---->", info.target)

    return info
  }

  private getAfterActions = (transition: S.Transitions<TContext, TState, TEvent>, delay?: number) => {
    let id: ReturnType<typeof globalThis.setTimeout>

    return {
      entry: () => {
        id = globalThis.setTimeout(() => {
          const next = this.getNextStateInfo(transition, this.state.event)
          this.performStateChangeEffects(this.state.value!, next, this.state.event)
        }, delay)
      },
      exit: () => {
        globalThis.clearTimeout(id)
      },
    }
  }

  /**
   * All `after` events leverage `setTimeout` and `clearTimeout`,
   * we invoke the `clearTimeout` on exit and `setTimeout` on entry.
   *
   * To achieve this, we split the `after` defintion into `entry` and `exit`
   *  functions and append them to the state's `entry` and `exit` actions
   */
  private getDelayedEventActions = (state: TState["value"]) => {
    const stateNode = this.getStateNode(state)
    const event = this.state.event

    if (!stateNode || !stateNode.after) return

    const entries: VoidFunction[] = []
    const exits: VoidFunction[] = []

    if (isArray(stateNode.after)) {
      //
      const transition = this.determineTransition(stateNode.after, event)

      if (!transition) return

      if (!hasProp(transition, "delay")) {
        throw new Error(`[@zag-js/core > after] Delay is required for after transition: ${JSON.stringify(transition)}`)
      }

      const determineDelay = determineDelayFn((transition as any).delay, this.delayMap)
      const __delay = determineDelay(this.contextSnapshot, event)

      const actions = this.getAfterActions(transition, __delay)

      entries.push(actions.entry)
      exits.push(actions.exit)

      return { entries, exits }
    }

    if (isObject(stateNode.after)) {
      //
      for (const delay in stateNode.after) {
        const transition = stateNode.after[delay]

        const determineDelay = determineDelayFn(delay, this.delayMap)
        const __delay = determineDelay(this.contextSnapshot, event)

        const actions = this.getAfterActions(transition, __delay)

        entries.push(actions.entry)
        exits.push(actions.exit)
      }
    }

    return { entries, exits }
  }

  /**
   * A reference to the instance methods of the machine.
   * Useful when spawning child machines and managing the communication between them.
   */
  private get self(): S.Self<TContext, TState, TEvent> {
    const self = this
    return {
      id: this.id,
      send: this.send.bind(this),
      sendParent: this.sendParent.bind(this),
      sendChild: this.sendChild.bind(this),
      stop: this.stop.bind(this),
      stopChild: this.stopChild.bind(this),
      spawn: this.spawn.bind(this) as any,
      stopActivity: this.stopActivity.bind(this),
      get state() {
        return self.stateSnapshot
      },
      get initialContext() {
        return self.initialContext
      },
      get initialState() {
        return self.initialState?.target ?? ""
      },
    }
  }

  private get meta(): S.Meta<TContext, TState, TEvent> {
    return {
      state: this.stateSnapshot,
      guards: this.guardMap,
      send: this.send.bind(this),
      self: this.self,
      initialContext: this.initialContext,
      initialState: this.initialState?.target ?? "",
      getState: () => this.stateSnapshot,
      getAction: (key) => this.actionMap[key],
      getGuard: (key) => this.guardMap[key],
    }
  }

  private get guardMeta(): S.GuardMeta<TContext, TState, TEvent> {
    return {
      state: this.stateSnapshot,
    }
  }

  /**
   * Function to executes defined actions. It can accept actions as string
   * (referencing `options.actions`) or actual functions.
   */
  private executeActions = (actions: S.Actions<TContext, TState, TEvent> | undefined, event: TEvent) => {
    const pickedActions = determineActionsFn(actions, this.guardMap)(this.contextSnapshot, event, this.guardMeta)
    for (const action of toArray(pickedActions)) {
      const fn = isString(action) ? this.actionMap?.[action] : action
      warn(
        isString(action) && !fn,
        `[@zag-js/core > execute-actions] No implementation found for action: \`${action}\``,
      )
      fn?.(this.state.context, event, this.meta)
    }
  }

  /**
   * Function to execute running activities and registers
   * their cleanup function internally (to be called later on when we exit the state)
   */
  private executeActivities = (
    event: TEvent,
    activities: Array<S.Activity<TContext, TState, TEvent>>,
    state?: TState["value"],
  ) => {
    for (const activity of activities) {
      const fn = isString(activity) ? this.activityMap?.[activity] : activity

      if (!fn) {
        warn(`[@zag-js/core > execute-activity] No implementation found for activity: \`${activity}\``)
        continue
      }

      const cleanup = fn(this.state.context, event, this.meta)

      if (cleanup) {
        const key = isString(activity) ? activity : activity.name || uuid()
        this.addActivityCleanup(state ?? this.state.value, key, cleanup)
      }
    }
  }

  /**
   * Normalizes the `every` definition to transition. `every` can be:
   * - An array of possible actions to run (we need to pick the first match based on guard)
   * - An object of intervals and actions
   */
  private createEveryActivities = (
    every: S.StateNode<TContext, TState, TEvent>["every"] | undefined,
    callbackfn: (activity: S.Activity<TContext, TState, TEvent>) => void,
  ) => {
    if (!every) return

    // every: [{ interval: 2000, actions: [...], guard: "isValid" },  { interval: 1000, actions: [...] }]
    if (isArray(every)) {
      // picked = { interval: string | number | <ref>, actions: [...], guard: ... }
      const picked = toArray(every).find((transition) => {
        //
        const delayOrFn = transition.delay
        const determineDelay = determineDelayFn(delayOrFn, this.delayMap)
        const delay = determineDelay(this.contextSnapshot, this.state.event)

        const determineGuard = determineGuardFn(transition.guard, this.guardMap)
        const guard = determineGuard(this.contextSnapshot, this.state.event, this.guardMeta)

        return guard ?? delay != null
      })

      if (!picked) return

      const determineDelay = determineDelayFn(picked.delay, this.delayMap)
      const delay = determineDelay(this.contextSnapshot, this.state.event)

      const activity = () => {
        const id = globalThis.setInterval(() => {
          this.executeActions(picked.actions, this.state.event)
        }, delay)
        return () => {
          globalThis.clearInterval(id)
        }
      }
      callbackfn(activity)
      //
    } else {
      // every = { 1000: [fn, fn] }
      for (const interval in every) {
        const actions = every?.[interval]

        // interval could be a `ref` not the actual interval value, let's determine the actual value
        const determineDelay = determineDelayFn(interval, this.delayMap)
        const delay = determineDelay(this.contextSnapshot, this.state.event)

        // create the activity to run for each `every` reaction
        const activity = () => {
          const id = globalThis.setInterval(() => {
            this.executeActions(actions, this.state.event)
          }, delay)
          return () => {
            globalThis.clearInterval(id)
          }
        }
        callbackfn(activity)
      }
    }
  }

  private setEvent = (event: TEvent | TEvent["type"]) => {
    this.state.previousEvent = this.state.event
    this.state.event = ref(toEvent(event))
  }

  private performExitEffects = (current: TState["value"] | undefined, event: TEvent) => {
    const currentState = this.state.value!

    // don't clean up root state, it'll get cleaned up on stop()
    if (currentState === "") return

    const stateNode = current ? this.getStateNode(current) : undefined

    // cleanup activities for current state
    this.stopActivities(currentState)

    // get explicit exit and implicit "after.exit" actions for current state
    const _exit = determineActionsFn(stateNode?.exit, this.guardMap)(this.contextSnapshot, event, this.guardMeta)
    const exitActions = toArray(_exit)

    const afterExitActions = this.delayedEvents.get(currentState)

    if (afterExitActions) {
      exitActions.push(...afterExitActions)
    }

    // call all exit actions for current state
    this.executeActions(exitActions, event)
  }

  private performEntryEffects = (next: TState["value"], event: TEvent) => {
    const stateNode = this.getStateNode(next)

    // execute activities for next state
    const activities = toArray(stateNode?.activities)

    // if `every` is defined, create an activity and append to activities
    this.createEveryActivities(stateNode?.every, (activity) => {
      activities.unshift(activity)
    })

    if (activities.length > 0) {
      this.executeActivities(event, activities)
    }

    // get all entry actions
    const pickedActions = determineActionsFn(stateNode?.entry, this.guardMap)(
      this.contextSnapshot,
      event,
      this.guardMeta,
    )
    const entryActions = toArray(pickedActions)
    const afterActions = this.getDelayedEventActions(next)

    if (stateNode?.after && afterActions) {
      this.delayedEvents.set(next, afterActions?.exits)
      entryActions.push(...afterActions.entries)
    }

    // execute entry actions for next state
    this.executeActions(entryActions, event)

    if (stateNode?.type === "final") {
      this.state.done = true
      this.doneListeners.forEach((listener) => {
        listener(this.stateSnapshot)
      })
      this.stop()
    }
  }

  private performTransitionEffects = (
    transitions: S.Transitions<TContext, TState, TEvent> | undefined,
    event: TEvent,
  ) => {
    // execute transition actions
    const transition = this.determineTransition(transitions, event)
    this.executeActions(transition?.actions, event)
  }

  /**
   * Performs all the requires side-effects or reactions when
   * we move from state A => state B.
   *
   * The Effect order:
   * Exit actions (current state) => Transition actions  => Go to state => Entry actions (next state)
   */
  private performStateChangeEffects = (
    current: TState["value"] | undefined,
    next: S.StateInfo<TContext, TState, TEvent>,
    event: TEvent,
  ) => {
    // update event
    this.setEvent(event)

    const changed = next.changed || next.reenter

    if (changed) {
      this.performExitEffects(current, event)
    }

    // execute transition actions
    this.performTransitionEffects(next.transition, event)

    // go to next state
    this.setState(next.target)

    if (changed) {
      this.performEntryEffects(next.target, event)
    }
  }

  private determineTransition = (transition: S.Transitions<TContext, TState, TEvent> | undefined, event: TEvent) => {
    const fn = determineTransitionFn(transition, this.guardMap)
    return fn?.(this.contextSnapshot, event, this.guardMeta)
  }

  /**
   * Function to send event to parent machine from spawned child
   */
  public sendParent = (evt: S.Event<S.AnyEventObject>) => {
    if (!this.parent) {
      invariant("[@zag-js/core > send-parent] Cannot send event to an unknown parent")
    }
    const event = toEvent<S.AnyEventObject>(evt)
    this.parent?.send(event)
  }

  private log = (...args: any[]) => {
    if (isDev() && this.options.debug) {
      console.log(...args)
    }
  }

  /**
   * Function to send an event to current machine
   */
  public send = (evt: S.Event<TEvent>) => {
    const event = toEvent<TEvent>(evt)
    this.transition(this.state.value, event)
  }

  public transition = (state: TState["value"] | S.StateInfo<TContext, TState, TEvent> | null, evt: S.Event<TEvent>) => {
    const stateNode = isString(state) ? this.getStateNode(state) : state?.stateNode

    const event = toEvent(evt)

    if (!stateNode && !this.config.on) {
      const msg =
        this.status === MachineStatus.Stopped
          ? "[@zag-js/core > transition] Cannot transition a stopped machine"
          : `[@zag-js/core > transition] State does not have a definition for \`state\`: ${state}, \`event\`: ${event.type}`
      warn(msg)
      return
    }

    const transitions: S.Transitions<TContext, TState, TEvent> =
      // @ts-expect-error - Fix this
      stateNode?.on?.[event.type] ?? this.config.on?.[event.type]

    const next = this.getNextStateInfo(transitions, event)
    this.performStateChangeEffects(this.state.value!, next, event)

    return next.stateNode
  }

  subscribe = (listener: S.StateListener<TContext, TState, TEvent>) => {
    this.stateListeners.add(listener)

    if (this.status === MachineStatus.Running) {
      listener(this.stateSnapshot)
    }

    return () => {
      this.stateListeners.delete(listener)
    }
  }

  public onDone = (listener: S.StateListener<TContext, TState, TEvent>) => {
    this.doneListeners.add(listener)
    return this
  }

  public onTransition = (listener: S.StateListener<TContext, TState, TEvent>) => {
    this.stateListeners.add(listener)
    if (this.status === MachineStatus.Running) {
      listener(this.stateSnapshot)
    }
    return this
  }

  get [Symbol.toStringTag]() {
    return "Machine"
  }

  public getHydrationState(): S.StateInit<TContext, TState> {
    const state = this.getState()
    return {
      value: state.value,
      tags: state.tags,
    }
  }
}

export type MachineSrc<
  TContext extends Dict,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
> = Machine<TContext, TState, TEvent> | (() => Machine<TContext, TState, TEvent>)

export type AnyMachine = Machine<Dict, S.StateSchema, S.AnyEventObject>

export const createMachine = <
  TContext extends Dict,
  TState extends S.StateSchema = S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(
  config: S.MachineConfig<TContext, TState, TEvent>,
  options?: S.MachineOptions<TContext, TState, TEvent>,
) => new Machine(config, options)

export const isMachine = (value: any): value is AnyMachine => {
  return value instanceof Machine || value?.type === MachineType.Machine
}
