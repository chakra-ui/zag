import type {
  ActionsOrFn,
  BindableContext,
  BindableRefs,
  ChooseFn,
  ComputedFn,
  Effect,
  EffectDeps,
  EffectsOrFn,
  GuardFn,
  Machine,
  MachineSchema,
  Params,
  Service,
} from "@zag-js/core"
import {
  createScope,
  findTransition,
  getExitEnterStates,
  hasTag,
  INIT_STATE,
  MachineStatus,
  matchesState,
  resolveStateValue,
} from "@zag-js/core"
import { ensure, isEqual, isFunction, isString, toArray, warn } from "@zag-js/utils"
import { flushSync } from "preact/compat"
import { useLayoutEffect, useMemo, useRef } from "preact/hooks"
import { useBindable } from "./bindable"
import { useRefs } from "./refs"
import { useTrack } from "./track"

type EffectConfig<T extends MachineSchema> = Effect<T> extends infer U ? (U extends string ? { key: U } : U) : never

type TrackedEffect = {
  deps?: Array<() => any>
  values?: any[]
  cleanup?: VoidFunction
  run: () => void | VoidFunction
}

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
    getRefs() {
      return refs as any
    },
    getEvent() {
      return getEvent()
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
  const trackedEffects = useRef(new Map<string, TrackedEffect[]>())
  const transitionRef = useRef<any>(null)

  const previousEventRef = useRef<any>(null)
  const eventRef = useRef<any>({ type: "" })

  const refs: BindableRefs<T> = useRefs(machine.refs?.({ prop, context: ctx }) ?? {})

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
      return hasTag(machine, currentState, tag)
    },
    matches(...values: T["state"][]) {
      const currentState = state.get()
      return values.some((value) => matchesState(currentState as string, value as string))
    },
  })

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
      context: ctx as any,
      event: getEvent(),
      prop,
      refs,
      scope,
      computed: computed as any,
    })
  }

  const resolveEffectDeps = (deps: EffectDeps<T> | undefined) => {
    if (!deps) return
    const getList = () => (isFunction(deps) ? deps(getParams()) : deps) ?? []
    const list = getList()
    return list.map((_, index) => {
      return () => {
        const values = getList()
        const value = values?.[index]
        if (isFunction(value)) return (value as any)(getParams())
        return value
      }
    })
  }

  const normalizeEffects = (keys: EffectsOrFn<T> | undefined) => {
    const items = isFunction(keys) ? keys(getParams()) : keys
    if (!items) return
    return items.map((item) => {
      if (isString(item)) return { key: item } as EffectConfig<T>
      return item as EffectConfig<T>
    })
  }

  const hasDepsChanged = (prev: any[] | undefined, next: any[]) => {
    if (!prev || prev.length !== next.length) return true
    for (let index = 0; index < next.length; index++) {
      if (!isEqual(prev[index], next[index])) return true
    }
    return false
  }

  const effect = (keys: EffectsOrFn<T> | undefined, path?: string) => {
    const items = normalizeEffects(keys)
    if (!items) return

    const tracked: TrackedEffect[] = []
    const cleanups: VoidFunction[] = []

    for (const item of items) {
      const fn = machine.implementations?.effects?.[item.key]
      if (!fn) {
        warn(`[zag-js] No implementation found for effect "${JSON.stringify(item.key)}"`)
        continue
      }

      const deps = resolveEffectDeps(item.deps)
      const record: TrackedEffect = {
        deps,
        run: () => fn?.(getParams()),
      }

      if (deps?.length) {
        record.values = deps.map((dep) => dep())
        record.cleanup = record.run() ?? undefined
        tracked.push(record)
      } else {
        const cleanup = record.run()
        if (cleanup) cleanups.push(cleanup)
      }
    }

    if (tracked.length && path) {
      trackedEffects.current.set(path, tracked)
    }

    if (!tracked.length && !cleanups.length && !path) return

    return () => {
      tracked.forEach((record) => record.cleanup?.())
      cleanups.forEach((fn) => fn?.())
      if (path) trackedEffects.current.delete(path)
    }
  }

  const refreshTrackedEffects = () => {
    trackedEffects.current.forEach((records) => {
      records.forEach((record) => {
        if (!record.deps?.length) return
        const next = record.deps.map((dep) => dep())
        if (!hasDepsChanged(record.values, next)) return
        record.cleanup?.()
        record.cleanup = record.run() ?? undefined
        record.values = next
      })
    })
  }

  useLayoutEffect(() => {
    refreshTrackedEffects()
  })

  const state = useBindable(() => ({
    defaultValue: resolveStateValue(machine, machine.initialState({ prop })),
    onChange(nextState, prevState) {
      currentStateRef.current = nextState as string
      const { exiting, entering } = getExitEnterStates(machine, prevState, nextState, transitionRef.current?.reenter)

      exiting.forEach((item) => {
        const exitEffects = effects.current.get(item.path)
        exitEffects?.()
        effects.current.delete(item.path)
      })

      exiting.forEach((item) => {
        action(item.state?.exit)
      })

      action(transitionRef.current?.actions)

      entering.forEach((item) => {
        const cleanup = effect(item.state?.effects, item.path)
        if (cleanup) effects.current.set(item.path, cleanup)
      })

      if (prevState === INIT_STATE) {
        action(machine.entry)
        const cleanup = effect(machine.effects, INIT_STATE)
        if (cleanup) effects.current.set(INIT_STATE, cleanup)
      }

      entering.forEach((item) => {
        action(item.state?.entry)
      })
    },
  }))
  const currentStateRef = useRef<string>(state.initial as string)

  // improve HMR (to restart effects)
  const hydratedStateRef = useRef<string | undefined>(undefined)
  const statusRef = useRef(MachineStatus.NotStarted)

  useLayoutEffect(() => {
    const started = statusRef.current === MachineStatus.Started
    statusRef.current = MachineStatus.Started
    debug(started ? "rehydrating..." : "initializing...")

    // start the transition
    const initialState = hydratedStateRef.current ?? state.initial!
    state.invoke(initialState, started ? state.get() : INIT_STATE)

    const fns = effects.current
    const currentState = state.ref.current
    return () => {
      debug("unmounting...")
      hydratedStateRef.current = currentState
      statusRef.current = MachineStatus.Stopped

      fns.forEach((fn) => fn?.())
      effects.current = new Map()
      trackedEffects.current.clear()
      transitionRef.current = null

      action(machine.exit)
    }
  }, [])

  const getCurrentState = () => {
    return currentStateRef.current
  }

  const send = (event: any) => {
    queueMicrotask(() => {
      if (statusRef.current !== MachineStatus.Started) return

      previousEventRef.current = eventRef.current
      eventRef.current = event

      let currentState = getCurrentState()

      const { transitions, source } = findTransition(machine, currentState, event.type as string)
      const transition = choose(transitions)
      if (!transition) return

      // save current transition
      transitionRef.current = transition
      const target = resolveStateValue(machine, transition.target ?? currentState, source)

      const changed = target !== currentState
      if (changed) {
        currentStateRef.current = target as string
        // state change is high priority
        flushSync(() => state.set(target))
      } else if (transition.reenter) {
        state.invoke(currentState, currentState)
      } else {
        // call transition actions
        action(transition.actions ?? [])
      }

      if (trackedEffects.current.size > 0) {
        refreshTrackedEffects()
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
    getStatus: () => statusRef.current,
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
