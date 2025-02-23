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
import { createScope } from "@zag-js/core"
import { isFunction, isString, toArray, warn } from "@zag-js/utils"
import { flushSync, onDestroy, onMount } from "svelte"
import { bindable } from "./bindable.svelte"
import { useRefs } from "./refs.svelte"
import { track } from "./track.svelte"

function access<T>(userProps: T | (() => T)): T {
  if (isFunction(userProps)) return userProps()
  return userProps
}

export function useMachine<T extends MachineSchema>(
  machine: Machine<T>,
  userProps: Partial<T["props"]> | (() => Partial<T["props"]>),
): Service<T> {
  const scope = $derived.by(() => {
    const { id, ids, getRootNode } = access(userProps) as any
    return createScope({ id, ids, getRootNode })
  })

  const props: any = $derived(machine.props?.({ props: access(userProps), scope }) ?? access(userProps))
  const prop = useProp(() => props)

  const context: any = machine.context?.({
    prop,
    bindable: bindable,
    get scope() {
      return scope
    },
    flush: flush,
    getContext() {
      return ctx
    },
    getComputed() {
      return computed as any
    },
  })

  const ctx: BindableContext<T> = {
    get(key) {
      return context?.[key].get()
    },
    set(key, value) {
      context?.[key].set(value)
    },
    initial(key) {
      return context?.[key].initial
    },
    hash(key) {
      const current = context?.[key].get()
      return context?.[key].hash(current)
    },
  }

  let effects = new Map<string, VoidFunction>()
  let transitionRef: any = { current: null }

  let previousEventRef: any = { current: null }
  let eventRef: any = { current: { type: "" } }

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
    hasTag(tag: T["tag"]) {
      const currentState = state.get()
      return !!machine.states[currentState as T["state"]]?.tags?.includes(tag)
    },
    matches(...values: T["state"][]) {
      const currentState = state.get()
      return values.includes(currentState)
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
    return (
      machine.computed?.[key]({
        context: ctx,
        event: getEvent(),
        prop,
        refs,
        scope,
        computed: computed as any,
      }) ?? ({} as any)
    )
  }

  const state = bindable(() => ({
    defaultValue: machine.initialState({ prop }),
    onChange(nextState, prevState) {
      // compute effects: exit -> transition -> enter

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
      action(transitionRef.current?.actions)

      // enter effect
      const cleanup = effect(machine.states[nextState]?.effects)
      if (cleanup) effects.set(nextState as string, cleanup)

      // root entry actions
      if (prevState === "__init__") {
        action(machine.entry)
        const cleanup = effect(machine.effects)
        if (cleanup) effects.set("__init__", cleanup)
      }

      // enter actions
      action(machine.states[nextState]?.entry)
    },
  }))

  onMount(() => {
    state.invoke(state.initial!, "__init__")
  })

  onDestroy(() => {
    effects.forEach((fn) => fn?.())
    effects = new Map()
    // root exit actions
    action(machine.exit ?? [])
  })

  const send = (event: any) => {
    previousEventRef.current = eventRef.current
    eventRef.current = event

    let currentState = state.get()

    // @ts-ignore
    const transitions = machine.states[currentState].on?.[event.type] ?? machine.on?.[event.type]

    const transition = choose(transitions)
    if (!transition) return

    // save current transition
    transitionRef.current = transition
    const target = transition.target ?? currentState

    const changed = target !== currentState
    if (changed) {
      // state change is high priority
      state.set(target)
    } else {
      // call transition actions
      action(transition.actions ?? [])
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
  } as Service<T>
}

function useProp<T>(value: () => T) {
  return function get<K extends keyof T>(key: K): T[K] {
    return value()[key]
  }
}

function flush(fn: VoidFunction) {
  flushSync(() => fn())
}
