import type {
  ActionsOrFn,
  BindableContext,
  ChooseFn,
  ComputedFn,
  EffectsOrFn,
  GuardFn,
  Machine,
  MachineSchema,
  Params,
  Service,
} from "@zag-js/core"
import { createScope, INIT_STATE, MachineStatus } from "@zag-js/core"
import { compact, ensure, isFunction, isString, toArray, warn } from "@zag-js/utils"
import { bindable } from "./bindable"
import { useRefs } from "./refs"
import { track } from "./track"
import Alpine from "alpinejs"

export function useMachine<T extends MachineSchema>(
  machine: Machine<T>,
  evaluateProps: (callback: (props: Partial<T["props"]>) => void) => void,
): Service<T> & { init: VoidFunction; destroy: VoidFunction } {
  let initialProps = {} as T["props"]
  evaluateProps((props) => {
    initialProps = props
  })
  // TODO: cache and update scope
  const { id, ids, getRootNode } = initialProps as any
  const scope = createScope({ id, ids, getRootNode })

  const debug = (...args: any[]) => {
    if (machine.debug) console.log(...args)
  }

  const props = Alpine.reactive({
    value: machine.props?.({ props: compact(initialProps), scope }) ?? initialProps,
  })
  Alpine.effect(() => {
    let p = {}
    evaluateProps((value) => (p = value))
    props.value = machine.props?.({ props: compact(p), scope }) ?? (p as any)
  })
  const prop = useProp(props)

  const context: any = machine.context?.({
    prop,
    bindable,
    scope,
    flush,
    getContext() {
      return ctx
    },
    getComputed() {
      return computed
    },
    getRefs() {
      return refs
    },
    getEvent() {
      return getEvent()
    },
  })

  const ctx: BindableContext<T> = {
    get(key) {
      return context[key]?.get()
    },
    set(key, value) {
      context[key]?.set(value)
    },
    initial(key) {
      return context[key]?.initial
    },
    hash(key) {
      const current = context[key]?.get()
      return context[key]?.hash(current)
    },
  }

  let effects = new Map<string, VoidFunction>()
  let transitionRef: any = null

  let previousEventRef: { current: any } = { current: null }
  let eventRef: { current: any } = { current: { type: "" } }

  const getEvent = () => ({
    ...eventRef.current,
    current() {
      return eventRef.current
    },
    previous() {
      return previousEventRef.current
    },
  })

  const getState = () => ({
    ...state,
    matches(...values: T["state"][]) {
      const currentState = state.get()
      return values.includes(currentState)
    },
    hasTag(tag: T["tag"]) {
      const currentState = state.get()
      return !!machine.states[currentState]?.tags?.includes(tag)
    },
  })

  const refs = useRefs(machine.refs?.({ prop, context: ctx }) ?? {})

  const getParams = (): Params<T> => ({
    state: getState(),
    context: ctx,
    event: getEvent(),
    prop,
    send,
    action,
    guard,
    track,
    refs,
    computed,
    flush,
    scope,
    choose,
  })

  const action = (keys: ActionsOrFn<T> | undefined) => {
    const strs = isFunction(keys) ? keys(getParams()) : keys
    if (!strs) return
    const fns = strs.map((s) => {
      const fn = machine.implementations?.actions?.[s]
      if (!fn) warn(`[zag-js] No implementation found for action "${JSON.stringify(s)}"`)
      return fn
    })
    for (const fn of fns) {
      fn?.(getParams())
    }
  }
  const guard = (str: T["guard"] | GuardFn<T>) => {
    if (isFunction(str)) return str(getParams())
    return machine.implementations?.guards?.[str](getParams())
  }

  const effect = (keys: EffectsOrFn<T> | undefined) => {
    const strs = isFunction(keys) ? keys(getParams()) : keys
    if (!strs) return
    const fns = strs.map((s) => {
      const fn = machine.implementations?.effects?.[s]
      if (!fn) warn(`[zag-js] No implementation found for effect "${JSON.stringify(s)}"`)
      return fn
    })
    const cleanups: VoidFunction[] = []
    for (const fn of fns) {
      const cleanup = fn?.(getParams())
      if (cleanup) cleanups.push(cleanup)
    }
    return () => cleanups.forEach((fn) => fn?.())
  }

  const choose: ChooseFn<T> = (transitions) => {
    return toArray(transitions).find((t) => {
      let result = !t.guard
      if (isString(t.guard)) result = !!guard(t.guard)
      else if (isFunction(t.guard)) result = t.guard(getParams())
      return result
    })
  }

  const computed: ComputedFn<T> = (key) => {
    ensure(machine.computed, () => `[zag-js] No computed object found on machine`)
    const fn = machine.computed[key]
    return fn({
      context: ctx,
      event: getEvent(),
      prop,
      refs,
      scope,
      computed: computed as any,
    })
  }

  const state = bindable(() => ({
    defaultValue: machine.initialState({ prop }),
    onChange(nextState, prevState) {
      // compute effects: exit -> transition -> enter

      queueMicrotask(() => {
        // exit effects
        if (prevState) {
          const exitEffects = effects.get(prevState)
          exitEffects?.()
          effects.delete(prevState)
        }

        // exit actions
        if (prevState) {
          action(machine.states[prevState]?.exit)
        }

        // transition actions
        action(transitionRef?.actions)

        // enter effect
        const cleanup = effect(machine.states[nextState]?.effects)
        if (cleanup) effects.set(nextState as string, cleanup)

        // root entry actions
        if (prevState === INIT_STATE) {
          action(machine.entry)
          const cleanup = effect(machine.effects)
          if (cleanup) effects.set(INIT_STATE, cleanup)
        }

        // enter actions
        action(machine.states[nextState]?.entry)
      })
    },
  }))

  let status = MachineStatus.NotStarted

  const init = () => {
    const started = status === MachineStatus.Started
    status = MachineStatus.Started
    debug(started ? "rehydrating..." : "initializing...")
    state.invoke(state.initial!, INIT_STATE)
  }

  const destroy = () => {
    debug("unmounting...")
    status = MachineStatus.Stopped

    effects.forEach((fn) => fn?.())
    effects = new Map()
    transitionRef.current = null

    action(machine.exit)
  }

  const send = (event: any) => {
    if (status !== MachineStatus.Started) return

    previousEventRef.current = eventRef.current
    eventRef.current = event

    let currentState = state.get()

    // @ts-ignore
    const transitions = machine.states[currentState].on?.[event.type] ?? machine.on?.[event.type]

    const transition = choose(transitions)
    if (!transition) return

    // save current transition
    transitionRef = transition
    const target = transition.target ?? currentState

    debug("transition", event.type, transition.target || currentState, `(${transition.actions})`)

    const changed = target !== currentState
    if (changed) {
      // state change is high priority
      state.set(target)
    } else if (transition.reenter && !changed) {
      // reenter will re-invoke the current state
      state.invoke(currentState, currentState)
    } else {
      // call transition actions
      action(transition.actions)
    }
  }

  machine.watch?.(getParams())

  return {
    state: getState(),
    send,
    context: ctx,
    prop,
    scope,
    refs,
    computed,
    event: getEvent(),
    getStatus: () => status,
    init,
    destroy,
  }
}

function useProp<T>(ref: { value: T }) {
  return function get<K extends keyof T>(key: K): T[K] {
    return ref.value[key]
  }
}

function flush(fn: VoidFunction) {
  queueMicrotask(() => fn())
}
