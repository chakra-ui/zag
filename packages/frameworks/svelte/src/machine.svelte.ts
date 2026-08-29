import type {
  ActionsOrFn,
  BindableContext,
  ChooseFn,
  ComputedFn,
  EffectParams,
  EffectRecord,
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
  isWatchEffect,
  MachineStatus,
  matchesState,
  resolveStateValue,
  watchEffect,
} from "@zag-js/core"
import { compact, ensure, isEqual, isFunction, isString, noop, toArray, warn } from "@zag-js/utils"
import { flushSync, onDestroy, onMount } from "svelte"
import { bindable } from "./bindable.svelte"
import { useRefs } from "./refs.svelte"
import { effectSync, track } from "./track.svelte"

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

  const debug = (...args: any[]) => {
    if (machine.debug) console.log(...args)
  }

  const props: any = $derived(machine.props?.({ props: compact(access(userProps)), scope }) ?? access(userProps))
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
    getRefs() {
      return refs as any
    },
    getEvent() {
      return getEvent()
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

  let effects = new Map<number, EffectRecord>()
  let effectId = 0

  let notify: VoidFunction = noop
  let transitionRef: { current: any } = { current: null }

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
    hasTag(tag: T["tag"]) {
      const currentState = state.get()
      return hasTag(machine, currentState, tag)
    },
    matches(...values: T["state"][]) {
      const currentState = state.get()
      return values.some((value) => matchesState(currentState as string, value as string))
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
      const id = ++effectId
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

      effects.set(id, record)
    }

    notify()
  }

  const stopEffects = (path: string) => {
    for (const [id, record] of effects) {
      if (record.path !== path) continue
      record.cleanup?.()
      effects.delete(id)
    }
    notify()
  }

  const reconcileEffects = () => {
    if (status !== MachineStatus.Started) return

    let stale: EffectRecord[] | undefined

    for (const record of effects.values()) {
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
        if (!effects.has(record.id)) continue
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
      context: ctx,
      event: getEvent(),
      prop,
      refs,
      scope,
      computed: computed as any,
    })
  }

  const state = bindable(() => ({
    defaultValue: resolveStateValue(machine, machine.initialState({ prop })),
    onChange(nextState, prevState) {
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

  let status = MachineStatus.NotStarted

  onMount(() => {
    const started = status === MachineStatus.Started
    status = MachineStatus.Started
    debug(started ? "rehydrating..." : "initializing...")
    state.invoke(state.initial!, INIT_STATE)
  })

  onDestroy(() => {
    if (status !== MachineStatus.Started) return

    debug("unmounting...")
    status = MachineStatus.Stopped

    effects.forEach((record) => record.cleanup?.())
    effects = new Map()
    transitionRef.current = null

    action(machine.exit)
  })

  const send = (event: any) => {
    if (status !== MachineStatus.Started) return

    previousEventRef.current = eventRef.current
    eventRef.current = event

    let currentState = state.get()

    const { transitions, source } = findTransition(machine, currentState, event.type as string)
    const transition = choose(transitions)
    if (!transition) return

    // save current transition
    transitionRef.current = transition
    const target = resolveStateValue(machine, transition.target ?? currentState, source)

    debug("transition", event.type, transition.target || currentState, `(${transition.actions})`)

    const changed = target !== currentState
    if (changed) {
      // state change is high priority
      state.set(target)
    } else if (transition.reenter) {
      // reenter will re-invoke the current state
      state.invoke(currentState, currentState)
    } else {
      // call transition actions
      action(transition.actions)
    }
  }

  machine.watch?.(getParams())

  notify = effectSync(reconcileEffects)

  return {
    get state() {
      return getState()
    },
    send,
    context: ctx,
    prop,
    get scope() {
      return scope
    },
    refs,
    computed,
    get event() {
      return getEvent()
    },
    getStatus: () => status,
  } as Service<T>
}

function useProp<T>(value: () => T) {
  return function get<K extends keyof T>(key: K): T[K] {
    return value()[key]
  }
}

function flush(fn: VoidFunction) {
  flushSync(() => {
    queueMicrotask(() => fn())
  })
}
