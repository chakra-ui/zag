import { cast, clear, invariant, isArray, isObject, isString, noop, runIfFn, uuid, warn } from "@ui-machines/utils"
import { klona } from "klona/json"
import { derive, subscribeKey, underive } from "valtio/utils"
import { ref, snapshot, subscribe } from "valtio/vanilla"
import { determineActionsFn } from "./action-utils"
import { createProxy } from "./create-proxy"
import { determineDelayFn } from "./delay-utils"
import { determineGuardFn } from "./guard-utils"
import { determineTransitionFn, toTransition } from "./transition-utils"
import { ActionTypes, Dict, MachineStatus, MachineType, StateMachine as S, VoidFunction, Writable } from "./types"
import { toArray, toEvent } from "./utils"

export class Machine<
  TContext extends Dict,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
> {
  public status: MachineStatus = MachineStatus.NotStarted
  public readonly state: S.State<TContext, TState, TEvent>
  public initialState: S.StateInfo<TContext, TState, TEvent> | undefined

  public id: string

  public type: MachineType = MachineType.Machine

  // Cleanup function map (per state)
  private activityEvents = new Map<string, Set<VoidFunction>>()
  private delayedEvents = new Map<string, VoidFunction[]>()

  // state update listeners the user can opt-in for
  private stateListeners = new Set<S.StateListener<TContext, TState, TEvent>>()
  private eventListeners = new Set<S.EventListener<TEvent>>()
  private doneListeners = new Set<S.StateListener<TContext, TState, TEvent>>()
  private contextWatchers = new Set<VoidFunction>()

  // Cleanup functions (for `subscribe`)
  private removeStateListener: VoidFunction = noop
  private removeEventListener: VoidFunction = noop

  // For Parent <==> Spawned Actor relationship
  private parent?: AnyMachine
  private children = new Map<string, AnyMachine>()

  // A map of guard, action, delay implementations
  private guardMap: S.GuardMap<TContext, TEvent>
  private actionMap: S.ActionMap<TContext, TState, TEvent>
  private delayMap: S.DelayMap<TContext, TEvent>
  private activityMap: S.ActivityMap<TContext, TState, TEvent>
  private sync: boolean
  public options?: S.MachineOptions<TContext, TState, TEvent>

  // Let's get started!
  constructor(
    public config: S.MachineConfig<TContext, TState, TEvent>,
    options?: S.MachineOptions<TContext, TState, TEvent>,
  ) {
    // deep clone the config
    this.options = klona(options)
    this.id = config.id ?? `machine-${uuid()}`

    // maps
    this.guardMap = this.options?.guards ?? {}
    this.actionMap = this.options?.actions ?? {}
    this.delayMap = this.options?.delays ?? {}
    this.activityMap = this.options?.activities ?? {}
    this.sync = this.options?.sync ?? false

    // create mutatable state
    this.state = createProxy(klona(config))
    this.setupComputed()

    // created actions
    const event = toEvent<TEvent>(ActionTypes.Created)
    this.executeActions(config?.created, event)
  }

  // immutable state value
  private get stateSnapshot(): S.State<TContext, TState, TEvent> {
    return cast(snapshot(this.state))
  }

  // immutable context value
  private get contextSnapshot(): TContext {
    return this.stateSnapshot.context
  }

  // Starts the interpreted machine.
  public start = (init?: S.StateInit<TContext, TState>) => {
    // Don't start if it's already running
    if (this.status === MachineStatus.Running) {
      return this
    }

    this.status = MachineStatus.Running
    const event = toEvent<TEvent>(ActionTypes.Init)

    if (init) {
      const resolved = isObject(init) ? init : { context: this.config.context!, value: init }
      this.setState(resolved.value)
      this.setContext(resolved.context as Partial<TContext>)
    }

    // start transition definition
    const transition = {
      target: !!init ? undefined : this.config.initial,
    }

    const info = this.getNextStateInfo(transition, event)
    info.target = cast(info.target || transition.target)
    this.initialState = info
    this.performStateChangeEffects(info.target, info, event)

    this.removeStateListener = subscribe(
      this.state,
      () => {
        this.stateListeners.forEach((listener) => {
          listener(this.stateSnapshot)
        })
      },
      this.sync,
    )

    // For some reason `subscribe(this.state.event)` doesn't work, so we use `subscribeKey`
    this.removeEventListener = subscribeKey(this.state, "event", (value) => {
      if (this.config.onEvent) {
        this.executeActions(this.config.onEvent, value)
      }
      for (const listener of this.eventListeners) {
        listener(value)
      }
    })

    this.setupContextWatchers()
    this.executeActivities(toEvent<TEvent>(ActionTypes.Start), toArray(this.config.activities), ActionTypes.Start)
    this.executeActions(this.config.entry, toEvent<TEvent>(ActionTypes.Start))

    return this
  }

  private setupContextWatchers = () => {
    for (const [key, fn] of Object.entries(this.config.watch ?? {})) {
      this.contextWatchers.add(
        subscribeKey(this.state.context, key, () => {
          this.executeActions(fn, this.state.event as TEvent)
        }),
      )
    }
  }

  private setupComputed = () => {
    // convert computed properties to valtio getters format
    const computed = cast<S.TComputedContext<TContext>>(this.config.computed ?? {})
    const deriveFns = Object.fromEntries(
      Object.entries(computed).map(([key, fn]: any) => [key, (get: any) => fn(get(this.state.context))]),
    )

    // attach computed properties to the state's context
    derive(deriveFns, { proxy: this.state.context })
  }

  private detachComputed = () => {
    underive(this.state.context, { delete: true })
  }

  // Stops the interpreted machine
  stop = () => {
    // No need to call if already stopped
    if (this.status === MachineStatus.Stopped) return

    this.setState(null)
    this.setEvent(ActionTypes.Stop)

    if (this.config.context) {
      this.setContext(this.config.context as Partial<TContext>)
    }

    // cleanups
    this.stopStateListeners()
    this.stopChildren()
    this.stopActivities()
    this.stopDelayedEvents()
    this.stopContextWatchers()
    this.stopEventListeners()

    // cleanup `derive` subscriptions that was attached to the context
    this.detachComputed()

    this.status = MachineStatus.Stopped
    this.executeActions(this.config.exit, toEvent<TEvent>(ActionTypes.Stop))
    return this
  }

  private stopEventListeners = () => {
    this.eventListeners.clear()
    this.removeEventListener()
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
  sendChild = (evt: S.Event<S.AnyEventObject>, to: string | ((ctx: TContext) => string)) => {
    const event = toEvent(evt)
    const id = runIfFn(to, this.contextSnapshot)
    const child = this.children.get(id)
    if (!child) {
      invariant(`[machine/send-child] Cannot send '${event.type}' event to unknown child`)
    }
    child!.send(event)
  }

  /**
   * Function to stop a running child machine or actor
   */
  stopChild = (id: string) => {
    if (!this.children.has(id)) {
      invariant("[machine/stop-child] Cannot stop unknown child")
    }
    this.children.get(id)!.stop()
    this.children.delete(id)
  }

  removeChild = (id: string) => {
    this.children.delete(id)
  }

  // Stop and delete spawned actors
  private stopChildren = () => {
    this.children.forEach((child) => child.stop())
    this.children.clear()
  }

  setParent = (parent: any) => {
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

  private addActivityCleanup = (state: TState["value"] | null, cleanup: VoidFunction) => {
    if (!state) return
    if (!this.activityEvents.has(state)) {
      this.activityEvents.set(state, new Set([cleanup]))
    } else {
      this.activityEvents.get(state)?.add(cleanup)
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
  setContext = (context: Partial<Writable<TContext>>) => {
    for (const key in context) {
      this.state.context[<keyof TContext>key] = context[key]!
    }
  }

  withContext = (context: Partial<Writable<TContext>>) => {
    this.detachComputed()
    const newContext = { ...this.config.context, ...context } as TContext
    return new Machine({ ...this.config, context: newContext }, this.options)
  }

  withOptions = (options: Partial<S.MachineOptions<TContext, TState, TEvent>>) => {
    this.detachComputed()
    return new Machine(this.config, { ...this.options, ...options })
  }

  setActions = (actions: Partial<S.MachineOptions<TContext, TState, TEvent>>["actions"]) => {
    this.actionMap = { ...this.actionMap, ...actions }
  }

  clone = () => {
    this.detachComputed()
    return new Machine(this.config, this.options)
  }

  private getStateNode = (state: TState["value"] | null) => {
    if (!state) return
    return this.config.states?.[state]
  }

  private getNextStateInfo = (
    transitions: S.Transitions<TContext, TState, TEvent>,
    event: TEvent,
  ): S.StateInfo<TContext, TState, TEvent> => {
    const transition = this.determineTransition(transitions, event)
    const target = transition?.target ?? this.state.value
    const stateNode = this.getStateNode(target)

    return {
      transition,
      stateNode,
      target: target!,
    }
  }

  private getActionFromDelayedTransition = (transition: S.DelayedTransition<TContext, TState, TEvent>) => {
    // get the computed delay
    const event = toEvent<TEvent>(ActionTypes.After)

    const determineDelay = determineDelayFn(transition.delay, this.delayMap)
    const delay = determineDelay(this.contextSnapshot, event)

    let id: ReturnType<typeof globalThis.setTimeout>

    return {
      entry: () => {
        id = globalThis.setTimeout(() => {
          const current = this.state.value!
          const next = this.getNextStateInfo(transition, event)
          this.performStateChangeEffects(current, next, event)
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
    const event = toEvent<TEvent>(ActionTypes.After)

    if (!stateNode || !stateNode.after) return

    const entries: VoidFunction[] = []
    const exits: VoidFunction[] = []

    if (isArray(stateNode.after)) {
      //
      const transition = this.determineTransition(stateNode.after, event)
      if (!transition) return

      const actions = this.getActionFromDelayedTransition(transition)
      entries.push(actions.entry)
      exits.push(actions.exit)
      //
    } else if (isObject(stateNode.after)) {
      //
      for (const delay in stateNode.after) {
        const transition = stateNode.after[delay]
        let resolvedTransition: S.DelayedTransition<TContext, TState, TEvent> = {}

        if (isArray(transition)) {
          //
          const picked = this.determineTransition(transition, event)
          if (picked) resolvedTransition = picked
          //
        } else if (isString(transition)) {
          resolvedTransition = { target: transition, delay }
        } else {
          resolvedTransition = { ...transition, delay }
        }

        const actions = this.getActionFromDelayedTransition(resolvedTransition)

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
    const _self = this
    return {
      id: this.id,
      send: this.send.bind(this),
      sendParent: this.sendParent.bind(this),
      sendChild: this.sendChild.bind(this),
      stop: this.stop.bind(this),
      stopChild: this.stopChild.bind(this),
      spawn: this.spawn.bind(this) as any,
      get state() {
        return _self.stateSnapshot
      },
    }
  }

  private get meta(): S.Meta<TContext, TState, TEvent> {
    return {
      state: this.stateSnapshot,
      guards: this.guardMap,
      send: this.send.bind(this),
      listen: this.onEvent.bind(this),
      self: this.self,
      getState: () => this.stateSnapshot,
    }
  }

  /**
   * Function to executes defined actions. It can accept actions as string
   * (referencing `options.actions`) or actual functions.
   */
  private executeActions = (actions: S.Actions<TContext, TState, TEvent> | undefined, event: TEvent) => {
    const _actions = determineActionsFn(actions, this.guardMap)(this.contextSnapshot, event)
    for (const action of toArray(_actions)) {
      const fn = isString(action) ? this.actionMap?.[action] : action
      warn(isString(action) && !fn, `[machine/exec-action] No implementation found for action: \`${action}\``)
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
        warn(`[machine/exec-activity] No implementation found for activity: \`${activity}\``)
        continue
      }

      const cleanup = fn(this.state.context, event, this.meta)
      if (cleanup) {
        this.addActivityCleanup(state ?? this.state.value, cleanup)
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
    const event = toEvent<TEvent>(ActionTypes.Every)

    // every: [{ interval: 2000, actions: [...], guard: "isValid" },  { interval: 1000, actions: [...] }]
    if (isArray(every)) {
      // picked = { interval: string | number | <ref>, actions: [...], guard: ... }
      const picked = toArray(every).find((t) => {
        //
        const determineDelay = determineDelayFn(t.delay, this.delayMap)
        t.delay = determineDelay(this.contextSnapshot, event)

        const determineGuard = determineGuardFn(t.guard, this.guardMap)
        const guard = determineGuard(this.contextSnapshot, event)

        return guard ?? t.delay
      })

      if (!picked) return

      const determineDelay = determineDelayFn(picked.delay, this.delayMap)
      const delay = determineDelay(this.contextSnapshot, event)

      const activity = () => {
        const id = globalThis.setInterval(() => {
          this.executeActions(picked.actions, event)
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
        const delay = determineDelay(this.contextSnapshot, event)

        // create the activity to run for each `every` reaction
        const activity = () => {
          const id = globalThis.setInterval(() => {
            this.executeActions(actions, event)
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
    this.state.event = ref(toEvent(event))
  }

  private performExitEffects = (current: TState["value"] | undefined, event: TEvent) => {
    const currentState = this.state.value!
    const stateNode = current ? this.getStateNode(current) : undefined

    // cleanup activities for current state
    this.stopActivities(currentState)

    // get explicit exit and implicit "after.exit" actions for current state
    const _exit = determineActionsFn(stateNode?.exit, this.guardMap)(this.contextSnapshot, event)
    const exitActions = toArray(_exit)

    const afterExitActions = this.delayedEvents.get(currentState)
    if (afterExitActions) {
      exitActions.push(...afterExitActions)
    }

    // call all exit actions for current state
    this.executeActions(exitActions, event)

    // remove all registered listeners
    this.eventListeners.clear()
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
    const _entry = determineActionsFn(stateNode?.entry, this.guardMap)(this.contextSnapshot, event)
    const entryActions = toArray(_entry)
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
    transition: S.Transitions<TContext, TState, TEvent> | undefined,
    event: TEvent,
  ) => {
    // execute transition actions
    const t = this.determineTransition(transition, event)
    this.executeActions(t?.actions, event)
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

    // determine next target
    next.target = next.target ?? this.state.value ?? undefined
    const ok = next.target && next.target !== this.state.value

    if (ok) {
      this.performExitEffects(current, event)
    }

    // execute transition actions
    this.performTransitionEffects(next?.transition, event)

    // go to next state
    this.setState(next.target)

    if (ok) {
      this.performEntryEffects(next.target, event)
    }
  }

  private determineTransition = (transition: S.Transitions<TContext, TState, TEvent> | undefined, event: TEvent) => {
    const fn = determineTransitionFn(transition, this.guardMap)
    return fn?.(this.contextSnapshot, event)
  }

  /**
   * Function to send event to parent machine from spawned child
   */
  sendParent = (evt: S.Event<S.AnyEventObject>) => {
    if (!this.parent) {
      invariant("[machine/send-parent] Cannot send event to an unknown parent")
    }
    const event = toEvent<S.AnyEventObject>(evt)
    this.parent?.send(event)
  }

  /**
   * Function to send an event to current machine
   */
  send = (evt: S.Event<TEvent>) => {
    const event = toEvent<TEvent>(evt)
    this.transition(this.state.value, event)
  }

  transition = (state: TState["value"] | S.StateInfo<TContext, TState, TEvent> | null, evt: S.Event<TEvent>) => {
    const stateNode = isString(state) ? this.getStateNode(state) : state?.stateNode

    const event = toEvent(evt)

    if (!stateNode && !this.config.on) {
      const msg =
        this.status === MachineStatus.Stopped
          ? "[machine/transition] Cannot transition a stopped machine"
          : "[machine/transition] State does not have a definition"
      warn(msg)
      return
    }

    const transitionConfig: S.Transitions<TContext, TState, TEvent> =
      stateNode?.on?.[event.type] ?? this.config.on?.[event.type]

    const transition = toTransition(transitionConfig, this.state.value)

    if (!transition) return

    const info = this.getNextStateInfo(transition, event)
    this.performStateChangeEffects(this.state.value!, info, event)

    return info.stateNode
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

  public onEvent = (listener: S.EventListener<TEvent>) => {
    listener(this.state.event)
    this.eventListeners.add(listener)
    return this
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
