import type {
  ActionsOrFn,
  Bindable,
  BindableContext,
  BindableRefs,
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
import { useMemo, useRef } from "react"
import { flushSync } from "react-dom"
import { useBindable } from "./bindable"
import { useRefs } from "./refs"
import { useTrack } from "./track"
import { useSafeLayoutEffect } from "./use-layout-effect"

export function useMachine<T extends MachineSchema>(
  machine: Machine<T>,
  userProps: Partial<T["props"]> = {},
): Service<T> {
  const scope = useMemo(() => {
    const { id, ids, getRootNode } = userProps as any
    return createScope({ id, ids, getRootNode })
  }, [userProps])

  const debug = (...args: any[]) => {
    if (machine.debug) console.log(...args)
  }

  const props: any = machine.props?.({ props: userProps, scope }) ?? userProps
  const prop = useProp(props)

  const context = machine.context?.({
    prop,
    bindable: useBindable,
    scope,
    flush,
    getContext() {
      return ctx as any
    },
    getComputed() {
      return computed as any
    },
  })

  const contextRef = useLiveRef<any>(context)
  const ctx: BindableContext<T> = {
    get(key) {
      return contextRef.current?.[key].ref.current
    },
    set(key, value) {
      contextRef.current?.[key].set(value)
    },
    initial(key) {
      return contextRef.current?.[key].initial
    },
    hash(key) {
      const current = contextRef.current?.[key].get()
      return contextRef.current?.[key].hash(current)
    },
  }

  const effects = useRef(new Map<string, VoidFunction>())
  const transitionRef = useRef<any>(null)

  const previousEventRef = useRef<any>(null)
  const eventRef = useRef<any>({ type: "" })

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
      return values.includes(state.ref.current)
    },
    hasTag(tag: T["tag"]) {
      return !!machine.states[state.ref.current as T["state"]]?.tags?.includes(tag)
    },
  })

  const refs: BindableRefs<T> = useRefs(machine.refs?.({ prop, context: ctx }) ?? {})

  const getParams = (): Params<T> => ({
    state: getState(),
    context: ctx,
    event: getEvent(),
    prop,
    send,
    action,
    guard,
    track: useTrack,
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
        context: ctx as any,
        event: getEvent(),
        prop,
        refs,
        scope,
        computed: computed as any,
      }) ?? ({} as any)
    )
  }

  const state = useBindable(() => ({
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

  useSafeLayoutEffect(() => {
    state.invoke(state.initial!, "__init__")
    const fns = effects.current
    return () => {
      fns.forEach((fn) => fn?.())
      effects.current = new Map()
      transitionRef.current = null
      action(machine.exit)
    }
  }, [])

  const getCurrentState = () => {
    if ("ref" in state) return state.ref.current
    return (state as Bindable<string>).get()
  }

  const send = (event: any) => {
    queueMicrotask(() => {
      previousEventRef.current = eventRef.current
      eventRef.current = event

      debug("send", event)

      let currentState = getCurrentState()

      const transitions =
        // @ts-ignore
        machine.states[currentState].on?.[event.type] ??
        // @ts-ignore
        machine.on?.[event.type]

      const transition = choose(transitions)
      if (!transition) return

      // save current transition
      transitionRef.current = transition
      const target = transition.target ?? currentState

      debug("transition", transition)

      const changed = target !== currentState
      if (changed) {
        // state change is high priority
        flushSync(() => state.set(target))
      } else {
        // call transition actions
        action(transition.actions ?? [])
      }
    })
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

function useLiveRef<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}

function useProp<T>(value: T) {
  const ref = useLiveRef(value)
  return function get<K extends keyof T>(key: K): T[K] {
    return ref.current[key]
  }
}

function flush(fn: VoidFunction) {
  queueMicrotask(() => {
    flushSync(() => fn())
  })
}
