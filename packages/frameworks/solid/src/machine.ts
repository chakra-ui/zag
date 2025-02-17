import type {
  ActionsOrFn,
  BaseSchema,
  GuardFn,
  MachineConfig,
  Service,
  ChooseFn,
  ComputedFn,
  EffectsOrFn,
  BindableContext,
  Params,
} from "@zag-js/core"
import { createScope } from "@zag-js/core"
import { isFunction, isString, toArray, warn } from "@zag-js/utils"
import { type Accessor, createMemo, mergeProps, onCleanup, onMount } from "solid-js"
import { createBindable } from "./bindable"
import { createRefs } from "./refs"
import { createTrack } from "./track"

export function useMachine<T extends BaseSchema>(
  machine: MachineConfig<T>,
  userProps: Partial<T["props"]> | Accessor<Partial<T["props"]>> = {},
): Service<T> {
  const scope = createMemo(() => {
    const { id, ids, getRootNode } = access(userProps) as any
    return createScope({ id, ids, getRootNode })
  })

  const debug = (...args: any[]) => {
    if (machine.debug) console.log(...args)
  }

  const props = createMemo(
    () =>
      machine.props?.({
        props: access(userProps),
        scope: scope(),
      }) ?? access(userProps),
  )

  const prop: any = createProp(props)

  const context: any = machine.context?.({
    prop,
    bindable: createBindable,
    get scope() {
      return scope()
    },
    flush,
    getContext() {
      return ctx as any
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

  const effects = { current: new Map<string, VoidFunction>() }
  const transitionRef: any = { current: null }

  const previousEventRef: any = { current: null }
  const eventRef: any = { current: { type: "" } }

  const getEvent = (): any =>
    mergeProps(eventRef.current, {
      current() {
        return eventRef.current
      },
      previous() {
        return previousEventRef.current
      },
    })

  const getState = () =>
    mergeProps(state, {
      matches(...values: T["state"][]) {
        const current = state.get()
        return values.includes(current)
      },
      hasTag(tag: T["tag"]) {
        const current = state.get()
        return !!machine.states[current as T["state"]]?.tags?.includes(tag)
      },
    })

  const refs = createRefs(machine.refs?.({ prop, context: ctx }) ?? {})

  const getParams = (): Params<T> => ({
    state: getState(),
    context: ctx,
    event: getEvent(),
    prop,
    send,
    action,
    guard,
    track: createTrack,
    refs,
    computed,
    flush,
    get scope() {
      return scope()
    },
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

  const computed: ComputedFn<T> = (key: keyof T["computed"]) => {
    return (
      machine.computed?.[key]({
        context: ctx,
        event: eventRef.current,
        prop,
        refs,
        scope: scope(),
        computed: computed,
      }) ?? ({} as any)
    )
  }

  const state = createBindable(() => ({
    defaultValue: machine.initialState({ prop }),
    onChange(nextState, prevState) {
      // compute effects: exit -> transition -> enter

      // exit effects
      if (prevState) {
        const exitEffects = effects.current.get(prevState)
        exitEffects?.()
        effects.current.delete(prevState)
      }

      // exit actions
      if (prevState) {
        // @ts-ignore
        action(machine.states[prevState]?.exit)
      }

      // transition actions
      action(transitionRef.current?.actions)

      // enter effect
      // @ts-ignore
      const cleanup = effect(machine.states[nextState]?.effects)
      if (cleanup) effects.current.set(nextState as string, cleanup)

      // root entry actions
      if (prevState === "__init__") {
        action(machine.entry)
        const cleanup = effect(machine.effects)
        if (cleanup) effects.current.set("__init__", cleanup)
      }

      // enter actions
      // @ts-ignore
      action(machine.states[nextState]?.entry)
    },
  }))

  onMount(() => {
    state.invoke(state.initial!, "__init__")
  })

  onCleanup(() => {
    const fns = effects.current
    fns.forEach((fn) => fn?.())
    effects.current = new Map()
    // root exit actions
    action(machine.exit ?? [])
  })

  const send = (event: any) => {
    previousEventRef.current = eventRef.current
    eventRef.current = event

    debug("send", event)

    let currentState = state.get()

    const transitions =
      // @ts-ignore
      machine.states[currentState].on?.[event.type] ??
      // @ts-ignore
      machine.on?.[event.type]

    const transition = choose(transitions)
    if (!transition) return

    debug("transition", transition)

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
    get scope() {
      return scope()
    },
    refs,
    computed,
    event: getEvent(),
  } as unknown as Service<T>
}

function flush(fn: VoidFunction) {
  fn()
}

function access<T>(value: T | Accessor<T>) {
  return isFunction(value) ? value() : value
}

function createProp<T>(value: Accessor<T>) {
  return function get<K extends keyof T>(key: K): T[K] {
    return value()[key]
  }
}
