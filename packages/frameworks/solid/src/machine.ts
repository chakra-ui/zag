import type {
  ActionsOrFn,
  Effect,
  EffectDeps,
  GuardFn,
  Machine,
  MachineSchema,
  Service,
  ChooseFn,
  ComputedFn,
  EffectsOrFn,
  BindableContext,
  Params,
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
import { compact, isEqual, isFunction, isString, toArray, warn, ensure } from "@zag-js/utils"
import { type Accessor, createEffect, createMemo, mergeProps, onCleanup, onMount, untrack } from "solid-js"
import { createBindable } from "./bindable"
import { createRefs } from "./refs"
import { createTrack } from "./track"

type EffectConfig<T extends MachineSchema> = Effect<T> extends infer U ? (U extends string ? { type: U } : U) : never

type TrackedEffect = {
  deps?: () => any[]
  values?: any[]
  cleanup?: VoidFunction
  run: () => void | VoidFunction
}

export function useMachine<T extends MachineSchema>(
  machine: Machine<T>,
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
        props: compact(access(userProps)),
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

  const effects = { current: new Map<string, VoidFunction>() }
  const trackedEffects: { current: Map<string, TrackedEffect[]> } = { current: new Map() }
  const transitionRef: { current: any } = { current: null }

  const previousEventRef: { current: any } = { current: null }
  const eventRef: { current: any } = { current: { type: "" } }

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
        return values.some((value) => matchesState(current as string, value as string))
      },
      hasTag(tag: T["tag"]) {
        const current = state.get()
        return hasTag(machine, current, tag)
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
      event: eventRef.current,
      prop,
      refs,
      scope: scope(),
      computed: computed,
    })
  }

  const resolveEffectDeps = (deps: EffectDeps<T> | undefined) => {
    if (!deps) return
    const getList = () => (isFunction(deps) ? deps(getParams()) : deps) ?? []
    return () => {
      const list = getList()
      return list.map((value) => {
        if (isFunction(value)) return (value as any)(getParams())
        return value
      })
    }
  }

  const normalizeEffects = (keys: EffectsOrFn<T> | undefined) => {
    const items = isFunction(keys) ? keys(getParams()) : keys
    if (!items) return
    return items.map((item) => {
      if (isString(item)) return { type: item } as EffectConfig<T>
      return item as EffectConfig<T>
    })
  }

  const hasDepsChanged = (prev: any[] | undefined, next: any[]) => {
    if (!prev || prev.length !== next.length) return true
    for (let index = 0; index < next.length; index++) {
      if (prev[index] === next[index]) continue
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
      const fn = machine.implementations?.effects?.[item.type]
      if (!fn) {
        warn(`[zag-js] No implementation found for effect "${JSON.stringify(item.type)}"`)
        continue
      }

      const deps = resolveEffectDeps(item.deps)
      const record: TrackedEffect = {
        deps,
        run: () => fn?.(getParams()),
      }

      if (deps) {
        record.values = deps()
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
        if (!record.deps) return
        const next = record.deps()
        if (!hasDepsChanged(record.values, next)) return
        untrack(() => {
          record.cleanup?.()
          record.cleanup = record.run() ?? undefined
          record.values = next
        })
      })
    })
  }

  // Dependency getters used in refreshTrackedEffects read reactive values, so this effect
  // only reruns when those underlying signals change.
  createEffect(() => {
    refreshTrackedEffects()
  })

  const state = createBindable(() => ({
    defaultValue: resolveStateValue(machine, machine.initialState({ prop })),
    onChange(nextState, prevState) {
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

  let status = MachineStatus.NotStarted

  onMount(() => {
    const started = status === MachineStatus.Started
    status = MachineStatus.Started
    debug(started ? "rehydrating..." : "initializing...")
    state.invoke(state.initial!, INIT_STATE)
  })

  onCleanup(() => {
    debug("unmounting...")
    status = MachineStatus.Stopped

    const fns = effects.current
    fns.forEach((fn) => fn?.())
    effects.current = new Map()
    trackedEffects.current.clear()
    transitionRef.current = null

    action(machine.exit)
  })

  const send = (event: any) => {
    queueMicrotask(() => {
      if (status !== MachineStatus.Started) return

      previousEventRef.current = eventRef.current
      eventRef.current = event

      let currentState = untrack(() => state.get())

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
    })
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
    getStatus: () => status,
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
