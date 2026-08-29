import type {
  ActionsOrFn,
  BindableContext,
  BindableRefs,
  ChooseFn,
  ComputedFn,
  EffectsOrFn,
  EffectParams,
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
  isWatchEffect,
  MachineStatus,
  matchesState,
  resolveStateValue,
  watchEffect,
} from "@zag-js/core"
import { compact, ensure, isEqual, isFunction, isString, noop, toArray, warn } from "@zag-js/utils"
import { flushSync } from "preact/compat"
import { useLayoutEffect, useMemo, useRef } from "preact/hooks"
import { useBindable } from "./bindable"
import { useRefs } from "./refs"
import { useEffectSync, useTrack } from "./track"

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

  const props: any = machine.props?.({ props: compact(userProps), scope }) ?? userProps
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

  const effects = useRef(new Map<number, EffectRecord>())
  const effectId = useRef(0)

  let notify: VoidFunction = noop
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
    const fn = machine.implementations?.guards?.[str]
    if (!fn) warn(`[zag-js] No implementation found for guard "${JSON.stringify(str)}"`)
    return fn?.(getParams())
  }

  const startEffects = (path: string, keys: EffectsOrFn<T> | undefined) => {
    const strs = isFunction(keys) ? keys(getParams()) : keys
    if (!strs) return

    for (const name of strs) {
      const fn = machine.implementations?.effects?.[name]
      if (!fn) {
        warn(`[zag-js] No implementation found for effect "${JSON.stringify(name)}"`)
        continue
      }

      const result = fn({ ...getParams(), watchEffect } as EffectParams<T>)

      // one record per invocation, so a re-entered path keeps every setup's own cleanup
      const id = ++effectId.current
      const record: EffectRecord = { id, path, cleanup: undefined }

      if (isWatchEffect(result)) {
        record.deps = result.deps
        record.setup = result.setup
        const cleanup = result.setup()
        record.cleanup = isFunction(cleanup) ? cleanup : undefined
        // snapshot after setup, so a dep that setup itself touches cannot loop
        record.values = result.deps.map((d) => d())
      } else if (isFunction(result)) {
        record.cleanup = result
      }

      effects.current.set(id, record)
    }

    notify()
  }

  const stopEffects = (path: string) => {
    for (const [id, record] of effects.current) {
      if (record.path !== path) continue
      record.cleanup?.()
      effects.current.delete(id)
    }
    notify()
  }

  const reconcileEffects = () => {
    if (statusRef.current !== MachineStatus.Started) return

    let stale: EffectRecord[] | undefined

    for (const record of effects.current.values()) {
      const deps = record.deps
      if (!deps) continue
      const next = deps.map((d) => d())
      if (!next.some((value, index) => !isEqual(record.values![index], value))) continue
      record.values = next
      // setup() reads live values, so an already-queued restart covers this change too
      if (record.pending) continue
      record.pending = true
      ;(stale ??= []).push(record)
    }

    if (!stale) return

    // restart off the tracked scope, so setup()'s reads don't subscribe the reconciler
    queueMicrotask(() => {
      for (const record of stale) {
        record.pending = false
        if (!effects.current.has(record.id)) continue
        record.cleanup?.()
        const cleanup = record.setup!()
        record.cleanup = isFunction(cleanup) ? cleanup : undefined
      }
    })
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

  const state = useBindable(() => ({
    defaultValue: resolveStateValue(machine, machine.initialState({ prop })),
    onChange(nextState, prevState) {
      currentStateRef.current = nextState as string
      const { exiting, entering } = getExitEnterStates(machine, prevState, nextState, transitionRef.current?.reenter)

      exiting.forEach((item) => {
        stopEffects(item.path)
      })

      exiting.forEach((item) => {
        action(item.state?.exit)
      })

      action(transitionRef.current?.actions)

      entering.forEach((item) => {
        startEffects(item.path, item.state?.effects)
      })

      if (prevState === INIT_STATE) {
        action(machine.entry)
        startEffects(INIT_STATE, machine.effects)
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
    return () => {
      const currentState = getCurrentState()
      debug("unmounting...")
      hydratedStateRef.current = currentState
      statusRef.current = MachineStatus.Stopped

      fns.forEach((record) => record.cleanup?.())
      effects.current = new Map()
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
    })
  }

  machine.watch?.(getParams())

  notify = useEffectSync(reconcileEffects)

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

interface EffectRecord {
  id: number
  path: string
  cleanup: VoidFunction | undefined
  deps?: Array<() => any> | undefined
  values?: any[] | undefined
  pending?: boolean | undefined
  setup?: (() => VoidFunction | void) | undefined
}
