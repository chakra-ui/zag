import { cast, clear, invariant, isArray, isObject, isString, noop, runIfFn, uuid, warn } from "@ui-machines/utils"
import { klona } from "klona"
import { derive, subscribeKey, underive } from "valtio/utils"
import { ref, snapshot, subscribe } from "valtio/vanilla"
import { determineActionsFn } from "./action-utils"
import { createProxy } from "./create-proxy"
import { determineDelayFn } from "./delay-utils"
import { determineGuardFn } from "./guard-utils"
import { determineTransitionFn, toTransition } from "./transition-utils"
import { ActionTypes, Dict, MachineStatus, MachineType, StateMachine as S, VoidFunction, Writable } from "./types"
import { toArray, toEvent } from "./utils"

export function createMachine<
  TContext extends Dict,
  TState extends S.StateSchema = S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(
  config: S.MachineConfig<TContext, TState, TEvent>,
  _options?: S.MachineOptions<TContext, TState, TEvent>,
): S.Machine<TContext, TState, TEvent> {
  //
  const options: S.MachineOptions<TContext, TState, TEvent> = klona(_options) as any
  const id = config.id ?? `machine-${uuid()}`

  let type: MachineType = MachineType.Machine
  let status: MachineStatus = MachineStatus.NotStarted

  // Cleanup function map (per state)
  const activityEvents = new Map<string, Set<VoidFunction>>()
  const delayedEvents = new Map<string, VoidFunction[]>()

  // state update listeners the user can opt-in for
  const stateListeners = new Set<S.StateListener<TContext, TState, TEvent>>()
  const eventListeners = new Set<S.EventListener<TEvent>>()
  const contextListeners = new Set<S.ContextListener<TContext>>()
  const doneListeners = new Set<S.StateListener<TContext, TState, TEvent>>()
  const contextWatchers = new Set<VoidFunction>()

  // Cleanup functions (for `subscribe`)
  let removeStateListener: VoidFunction = noop
  let removeContextListener: VoidFunction = noop
  let removeEventListener: VoidFunction = noop

  // For Parent <==> Spawned Actor relationship
  let parent: S.Parent | undefined
  const children = new Map<string, S.Child>()

  // A map of guard, action, delay implementations
  let guardMap = options?.guards ?? {}
  let actionMap = options?.actions ?? {}
  let delayMap = options?.delays ?? {}
  let activityMap = options?.activities ?? {}
  let sync = options?.sync ?? false

  let initialState: S.StateInfo<TContext, TState, TEvent> | undefined = undefined
  const state = createProxy(klona(config))
  config.created?.(state.context)
  setupComputed()

  // immutable state value
  function _state(): S.State<TContext, TState, TEvent> {
    return cast(snapshot(state))
  }

  // immutable context value
  function _context(): TContext {
    return _state().context
  }

  function getStateNode(state: TState["value"] | null) {
    if (!state) return
    return config.states?.[state]
  }

  function setEvent(event: TEvent | TEvent["type"]) {
    state.event = ref(toEvent(event))
  }

  function setState(target: TState["value"] | null) {
    state.previousValue = state.value
    state.value = target

    const stateNode = getStateNode(target)

    if (target == null) {
      clear(state.tags)
    } else {
      state.tags = toArray(stateNode?.tags)
    }
  }

  function setContext(context: Partial<Writable<TContext>>) {
    for (const key in context) {
      state.context[<keyof TContext>key] = context[key]!
    }
  }

  const _this = {
    id,
    type,
    toString() {
      return `Machine: ${id}`
    },
    state,
    config,
    options,
    setContext,
    initialState() {
      return initialState
    },

    // Starts the interpreted machine.
    start(init?: S.StateInit<TContext, TState>) {
      // Don't start if it's already running
      if (status === MachineStatus.Running) {
        return _this
      }

      status = MachineStatus.Running
      const event = toEvent<TEvent>(ActionTypes.Init)

      if (init) {
        const resolved = isObject(init) ? init : { context: config.context!, value: init }
        setState(resolved.value)
        setContext(resolved.context as Partial<TContext>)
      }

      // start transition definition
      const transition = {
        target: !!init ? undefined : config.initial,
      }

      const info = getNextStateInfo(transition, event)
      info.target = cast(info.target || transition.target)
      initialState = info
      performStateChangeEffects(info.target, info, event)

      removeStateListener = subscribe(
        state,
        () => {
          stateListeners.forEach((listener) => {
            listener(_state())
          })
        },
        sync,
      )

      removeContextListener = subscribe(
        state.context,
        () => {
          contextListeners.forEach((listener) => {
            listener(_context())
          })
        },
        sync,
      )

      // For some reason `subscribe(state.event)` doesn't work, so we use `subscribeKey`
      removeEventListener = subscribeKey(state, "event", (value) => {
        if (config.onEvent) {
          executeActions(config.onEvent, value)
        }
        for (const listener of eventListeners) {
          listener(value)
        }
      })

      setupContextWatchers()
      executeActivities(toEvent<TEvent>(ActionTypes.Start), toArray(config.activities), ActionTypes.Start)
      executeActions(config.entry, toEvent<TEvent>(ActionTypes.Start))

      return _this
    },

    // Stops the interpreted machine
    stop() {
      // No need to call if already stopped
      if (status === MachineStatus.Stopped) {
        return _this
      }

      setState(null)
      setEvent(ActionTypes.Stop)

      if (config.context) {
        setContext(config.context as Partial<TContext>)
      }

      // cleanups
      stopStateListeners()
      stopContextListeners()
      stopChildren()
      stopActivities()
      stopDelayedEvents()
      stopContextWatchers()
      stopEventListeners()

      // cleanup `derive` subscriptions that was attached to the context
      detachComputed()

      status = MachineStatus.Stopped
      executeActions(config.exit, toEvent<TEvent>(ActionTypes.Stop))
      return _this
    },

    /**
     * Function to send an event to current machine
     */
    send(evt: S.Event<TEvent>) {
      const event = toEvent<TEvent>(evt)
      _this.transition(state.value, event)
    },

    /**
     * Function to send event to parent machine from spawned child
     */
    sendParent(evt: S.Event<S.AnyEventObject>) {
      if (!parent) {
        invariant("[machine/send-parent] Cannot send event to an unknown parent")
      }
      const event = toEvent<S.AnyEventObject>(evt)
      parent?.send(event)
    },

    /**
     * Function to send event to spawned child machine or actor
     */
    sendChild(evt: S.Event<S.AnyEventObject>, to: string | ((ctx: TContext) => string)) {
      const event = toEvent(evt)
      const id = runIfFn(to, _context())
      const child = children.get(id)
      if (!child) {
        invariant(`[machine/send-child] Cannot send '${event.type}' event to unknown child`)
      }
      child!.send(event)
    },

    /**
     * Function to stop a running child machine or actor
     */
    stopChild(id: string) {
      if (!children.has(id)) {
        invariant("[machine/stop-child] Cannot stop unknown child")
      }
      children.get(id)!.stop()
      children.delete(id)
    },

    removeChild(id: string) {
      children.delete(id)
    },

    setParent(value: any) {
      parent = value
    },

    spawn<T extends S.Actor>(src: T | (() => T), id?: string) {
      const actor = runIfFn(src)
      if (id) actor.id = id
      actor.type = MachineType.Actor
      actor.setParent(_this)
      children.set(actor.id, cast(actor))

      actor
        .onDone(() => {
          _this.removeChild(actor.id)
        })
        .start()

      return cast<T>(ref(actor))
    },

    transition(current: TState["value"] | S.StateInfo<TContext, TState, TEvent> | null, evt: S.Event<TEvent>) {
      const stateNode = isString(current) ? getStateNode(current) : current?.stateNode

      const event = toEvent(evt)

      if (!stateNode && !config.on) {
        const msg =
          status === MachineStatus.Stopped
            ? "[machine/transition] Cannot transition a stopped machine"
            : "[machine/transition] State does not have a definition"
        warn(msg)
        return
      }

      const transitionConfig: S.Transitions<TContext, TState, TEvent> =
        stateNode?.on?.[event.type] ?? config.on?.[event.type]

      const transition = toTransition(transitionConfig, state.value)

      if (!transition) return

      const info = getNextStateInfo(transition, event)
      performStateChangeEffects(state.value!, info, event)

      return info.stateNode
    },

    withContext(context: Partial<Writable<TContext>>) {
      detachComputed()
      const newContext = { ...config.context, ...context } as TContext
      return createMachine({ ...config, context: newContext }, options)
    },

    withConfig(newConfig: Partial<S.MachineConfig<TContext, TState, TEvent>>) {
      detachComputed()
      return createMachine({ ...config, ...newConfig }, options)
    },

    withOptions(newOptions: Partial<S.MachineOptions<TContext, TState, TEvent>>) {
      detachComputed()
      return createMachine(config, { ...options, ...newOptions })
    },

    setActions(actions: Partial<S.MachineOptions<TContext, TState, TEvent>>["actions"]) {
      actionMap = { ...actionMap, ...actions }
    },

    clone() {
      detachComputed()
      return createMachine(config, options)
    },

    meta(): S.Meta<TContext, TState, TEvent> {
      return {
        state: _state(),
        guards: guardMap,
        send: _this.send,
        listen: _this.onEvent,
        self: _this.self(),
        getState: _state,
      }
    },

    self(): S.Self<TContext, TState, TEvent> {
      return {
        id: id,
        send: _this.send,
        sendParent: _this.sendParent,
        sendChild: _this.sendChild,
        stop: stop,
        stopChild: _this.stopChild,
        spawn: _this.spawn,
        state: _state(),
      }
    },

    onDone(listener: S.StateListener<TContext, TState, TEvent>) {
      doneListeners.add(listener)
      return _this
    },

    subscribe(listener: S.StateListener<TContext, TState, TEvent>) {
      stateListeners.add(listener)
      if (status === MachineStatus.Running) {
        listener(_state())
      }
      return () => {
        stateListeners.delete(listener)
      }
    },

    onTransition(listener: S.StateListener<TContext, TState, TEvent>) {
      stateListeners.add(listener)
      if (status === MachineStatus.Running) {
        listener(_state())
      }
      return _this
    },

    onChange(listener: S.ContextListener<TContext>) {
      contextListeners.add(listener)
      return _this
    },

    onEvent(listener: S.EventListener<TEvent>) {
      listener(state.event)
      eventListeners.add(listener)
      return _this
    },
  }

  /**
   * Function to executes defined actions. It can accept actions as string
   * (referencing `options.actions`) or actual functions.
   */
  function executeActions(actions: S.Actions<TContext, TState, TEvent> | undefined, event: TEvent) {
    const _actions = determineActionsFn(actions, guardMap)(_context(), event)
    for (const action of toArray(_actions)) {
      const fn = isString(action) ? actionMap?.[action] : action
      warn(isString(action) && !fn, `[machine/exec-action] No implementation found for action: \`${action}\``)
      fn?.(state.context, event, _this.meta())
    }
  }

  function setupContextWatchers() {
    for (const [key, fn] of Object.entries(config.watch ?? {})) {
      contextWatchers.add(
        subscribeKey(state.context, key, () => {
          executeActions(fn, state.event as TEvent)
        }),
      )
    }
  }

  function stopContextWatchers() {
    contextWatchers.forEach((fn) => fn())
    contextWatchers.clear()
  }

  function stopEventListeners() {
    eventListeners.clear()
    removeEventListener()
  }

  function stopStateListeners() {
    removeStateListener()
    stateListeners.clear()
  }

  function stopContextListeners() {
    removeContextListener()
    contextListeners.clear()
  }

  // Stop and delete spawned actors
  function stopChildren() {
    children.forEach((child) => child.stop())
    children.clear()
  }

  function setupComputed() {
    // setup computed context values
    const computed = cast<S.TComputedContext<TContext>>(config.computed ?? {})
    const fns = Object.fromEntries(
      Object.entries(computed).map(([key, fn]: any) => [key, (get: any) => fn(get(state.context))]),
    )
    // attach computed properties to the state's context
    derive(fns, { proxy: state.context })
  }

  function detachComputed() {
    underive(state.context, { delete: true })
  }

  function determineTransition(transition: S.Transitions<TContext, TState, TEvent> | undefined, event: TEvent) {
    const fn = determineTransitionFn(transition, guardMap)
    return fn?.(_context(), event)
  }

  function getNextStateInfo(
    transitions: S.Transitions<TContext, TState, TEvent>,
    event: TEvent,
  ): S.StateInfo<TContext, TState, TEvent> {
    const resolvedTransition = determineTransition(transitions, event)
    const target = resolvedTransition?.target ?? state.value
    const stateNode = getStateNode(target)

    return {
      transition: resolvedTransition,
      stateNode,
      target: target!,
    }
  }

  function getActionFromDelayedTransition(transition: S.DelayedTransition<TContext, TState, TEvent>) {
    // get the computed delay
    const event = toEvent<TEvent>(ActionTypes.After)

    const determineDelay = determineDelayFn(transition.delay, delayMap)
    const delay = determineDelay(_context(), event)

    let id: ReturnType<typeof globalThis.setTimeout>

    return {
      entry: () => {
        id = globalThis.setTimeout(() => {
          const current = state.value!
          const next = getNextStateInfo(transition, event)
          performStateChangeEffects(current, next, event)
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
  function getDelayedEventActions(current: TState["value"]) {
    const stateNode = getStateNode(current)
    const event = toEvent<TEvent>(ActionTypes.After)

    if (!stateNode || !stateNode.after) return

    const entries: VoidFunction[] = []
    const exits: VoidFunction[] = []

    if (isArray(stateNode.after)) {
      //
      const transition = determineTransition(stateNode.after, event)
      if (!transition) return

      const actions = getActionFromDelayedTransition(transition)
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
          const picked = determineTransition(transition, event)
          if (picked) resolvedTransition = picked
          //
        } else if (isString(transition)) {
          resolvedTransition = { target: transition, delay }
        } else {
          resolvedTransition = { ...transition, delay }
        }

        const actions = getActionFromDelayedTransition(resolvedTransition)

        entries.push(actions.entry)
        exits.push(actions.exit)
      }
    }

    return { entries, exits }
  }

  function stopDelayedEvents() {
    delayedEvents.forEach((state) => {
      state.forEach((stop) => stop())
    })
    delayedEvents.clear()
  }

  /**
   * Normalizes the `every` definition to transition. `every` can be:
   * - An array of possible actions to run (we need to pick the first match based on guard)
   * - An object of intervals and actions
   */
  function createEveryActivities(
    every: S.StateNode<TContext, TState, TEvent>["every"] | undefined,
    callbackfn: (activity: S.Activity<TContext, TState, TEvent>) => void,
  ) {
    if (!every) return
    const event = toEvent<TEvent>(ActionTypes.Every)

    // every: [{ interval: 2000, actions: [...], guard: "isValid" },  { interval: 1000, actions: [...] }]
    if (isArray(every)) {
      // picked = { interval: string | number | <ref>, actions: [...], guard: ... }
      const picked = toArray(every).find((t) => {
        //
        const determineDelay = determineDelayFn(t.delay, delayMap)
        t.delay = determineDelay(_context(), event)

        const determineGuard = determineGuardFn(t.guard, guardMap)
        const guard = determineGuard(_context(), event)

        return guard ?? t.delay
      })

      if (!picked) return

      const determineDelay = determineDelayFn(picked.delay, delayMap)
      const delay = determineDelay(_context(), event)

      const activity = () => {
        const id = globalThis.setInterval(() => {
          executeActions(picked.actions, event)
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
        const determineDelay = determineDelayFn(interval, delayMap)
        const delay = determineDelay(_context(), event)

        // create the activity to run for each `every` reaction
        const activity = () => {
          const id = globalThis.setInterval(() => {
            executeActions(actions, event)
          }, delay)
          return () => {
            globalThis.clearInterval(id)
          }
        }
        callbackfn(activity)
      }
    }
  }

  function addActivityCleanup(current: TState["value"] | null, cleanup: VoidFunction) {
    if (!current) return
    if (!activityEvents.has(current)) {
      activityEvents.set(current, new Set([cleanup]))
    } else {
      activityEvents.get(current)?.add(cleanup)
    }
  }

  /**
   * Function to execute running activities and registers
   * their cleanup function internally (to be called later on when we exit the state)
   */
  function executeActivities(
    event: TEvent,
    activities: Array<S.Activity<TContext, TState, TEvent>>,
    current?: TState["value"],
  ) {
    for (const activity of activities) {
      const fn = isString(activity) ? activityMap?.[activity] : activity

      if (!fn) {
        warn(`[machine/exec-activity] No implementation found for activity: \`${activity}\``)
        continue
      }

      const cleanup = fn(state.context, event, _this.meta())
      if (cleanup) {
        addActivityCleanup(current ?? state.value, cleanup)
      }
    }
  }

  // Cleanup running activities (e.g `setInterval`, invoked callbacks, promises)
  function stopActivities(current?: TState["value"]) {
    // stop activities for a state
    if (current) {
      activityEvents.get(current)?.forEach((stop) => stop())
      activityEvents.get(current)?.clear()
      activityEvents.delete(current)
    } else {
      // stop every running activity
      activityEvents.forEach((state) => {
        state.forEach((stop) => stop())
        state.clear()
      })
      activityEvents.clear()
    }
  }

  function performEntryEffects(next: TState["value"], event: TEvent) {
    const stateNode = getStateNode(next)

    // execute activities for next state
    const activities = toArray(stateNode?.activities)

    // if `every` is defined, create an activity and append to activities
    createEveryActivities(stateNode?.every, (activity) => {
      activities.unshift(activity)
    })

    if (activities.length > 0) {
      executeActivities(event, activities)
    }

    // get all entry actions
    const _entry = determineActionsFn(stateNode?.entry, guardMap)(_context(), event)
    const entryActions = toArray(_entry)
    const afterActions = getDelayedEventActions(next)

    if (stateNode?.after && afterActions) {
      delayedEvents.set(next, afterActions?.exits)
      entryActions.push(...afterActions.entries)
    }

    // execute entry actions for next state
    executeActions(entryActions, event)

    if (stateNode?.type === "final") {
      state.done = true
      doneListeners.forEach((listener) => {
        listener(_state())
      })
      _this.stop()
    }
  }

  function performExitEffects(current: TState["value"] | undefined, event: TEvent) {
    const currentState = state.value!
    const stateNode = current ? getStateNode(current) : undefined

    // cleanup activities for current state
    stopActivities(currentState)

    // get explicit exit and implicit "after.exit" actions for current state
    const _exit = determineActionsFn(stateNode?.exit, guardMap)(_context(), event)
    const exitActions = toArray(_exit)

    const afterExitActions = delayedEvents.get(currentState)
    if (afterExitActions) {
      exitActions.push(...afterExitActions)
    }

    // call all exit actions for current state
    executeActions(exitActions, event)

    // remove all registered listeners
    eventListeners.clear()
  }

  function performTransitionEffects(transition: S.Transitions<TContext, TState, TEvent> | undefined, event: TEvent) {
    // execute transition actions
    const t = determineTransition(transition, event)
    executeActions(t?.actions, event)
  }

  /**
   * Performs all the requires side-effects or reactions when
   * we move from state A => state B.
   *
   * The Effect order:
   * Exit actions (current state) => Transition actions  => Go to state => Entry actions (next state)
   */
  function performStateChangeEffects(
    current: TState["value"] | undefined,
    next: S.StateInfo<TContext, TState, TEvent>,
    event: TEvent,
  ) {
    // update event
    setEvent(event)

    // determine next target
    next.target = next.target ?? state.value ?? undefined
    const ok = next.target && next.target !== state.value

    if (ok) {
      performExitEffects(current, event)
    }

    // execute transition actions
    performTransitionEffects(next?.transition, event)

    // go to next state
    setState(next.target)

    if (ok) {
      performEntryEffects(next.target, event)
    }
  }

  return _this
}
