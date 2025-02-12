import type { BaseSchema, Bindable, BindableContext, BindableRefs, GuardFn, MachineConfig, Service } from "@zag-js/core"
import { createScope } from "@zag-js/core"
import { isFunction, isString, toArray, warn } from "@zag-js/utils"
import { useLayoutEffect, useMemo, useRef } from "react"
import { flushSync } from "react-dom"
import { useBindable } from "./bindable"
import { useRefs } from "./refs"
import { useTrack } from "./track"

export function useMachine<T extends BaseSchema>(
  machine: MachineConfig<T>,
  userProps: Partial<T["props"]> = {},
): Service<T> {
  const scope = useMemo(() => {
    const { id, ids, getRootNode } = userProps as any
    return createScope({ id, ids, getRootNode })
  }, [userProps])

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
      return contextRef.current?.[key].get()
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
  const currentEvent = () => eventRef.current
  const previousEvent = () => previousEventRef.current

  const refs: BindableRefs<T> = useRefs(machine.refs?.({ prop, context: ctx }) ?? {})

  const getParams = (): any => ({
    state,
    context: ctx,
    event: {
      ...eventRef.current,
      current: currentEvent,
      previous: previousEvent,
    },
    prop,
    send,
    action,
    guard,
    track: useTrack,
    refs,
    computed,
    flush,
    scope,
  })

  const action = (strs: T["action"][]) => {
    const fns = strs.map((s) => {
      const fn = machine.implementations?.actions?.[s]
      if (!fn) warn(`[zag-js] No implementation found for action "${JSON.stringify(s)}"`)
      return fn
    })
    for (const fn of fns) {
      fn?.(getParams())
    }
  }

  const guard = (str: T["guard"] | GuardFn) => {
    if (isFunction(str)) return str(getParams())
    return machine.implementations?.guards?.[str](getParams())
  }

  const effect = (strs: T["effect"][]) => {
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

  const computed = (key: keyof T["computed"]) => {
    return machine.computed?.[key]({
      context: ctx as any,
      event: eventRef.current,
      prop,
      refs,
      scope,
      computed: computed as any,
    })
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
        action(machine.states[prevState]?.exit ?? [])
      }

      // transition actions
      action(transitionRef.current?.actions ?? [])

      // enter effect
      // @ts-ignore
      const cleanup = effect(machine.states[nextState]?.effects ?? [])
      effects.current.set(nextState as string, cleanup)

      // root entry actions
      if (prevState === "__init__") {
        action(machine.entry ?? [])
        const cleanup = effect(machine.effects ?? [])
        effects.current.set("__init__", cleanup)
      }

      // enter actions
      // @ts-ignore
      action(machine.states[nextState]?.entry ?? [])
    },
  }))

  useLayoutEffect(() => {
    state.invoke(state.initial!, "__init__")
    const fns = effects.current
    return () => {
      fns.forEach((fn) => fn?.())
      effects.current = new Map()
      transitionRef.current = null
      action(machine.exit ?? [])
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

      let currentState = getCurrentState()

      const transitions =
        // @ts-ignore
        machine.states[currentState].on?.[event.type] ??
        // @ts-ignore
        machine.on?.[event.type]

      const transition = toArray(transitions).find((t) => {
        let result = !t.guard
        if (isString(t.guard)) result = !!guard(t.guard)
        else if (isFunction(t.guard)) result = t.guard(getParams())
        return result
      })

      if (!transition) return

      // save current transition
      transitionRef.current = transition
      const target = transition.target ?? currentState

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

  const enhancedState = {
    ...state,
    hasTag(tag: T["tag"]) {
      const currentState = state.get()
      return !!machine.states[currentState as T["state"]]?.tags?.includes(tag)
    },
    matches(...values: T["state"][]) {
      const currentState = state.get()
      return values.includes(currentState)
    },
  }

  return {
    state: enhancedState,
    send,
    context: ctx,
    prop,
    scope,
    refs,
    computed,
    event: {
      ...eventRef.current,
      current: currentEvent,
      previous: previousEvent,
    },
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
