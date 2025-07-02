import type {
  ActionsOrFn,
  BindableContext,
  ChooseFn,
  ComputedFn,
  EffectsOrFn,
  GuardFn,
  Machine,
  MachineSchema,
  Service,
} from "@zag-js/core"
import { createScope, INIT_STATE, MachineStatus } from "@zag-js/core"
import { compact, ensure, isFunction, isString, toArray, warn } from "@zag-js/utils"
import { computed as __computed, nextTick, onBeforeUnmount, onMounted, toValue, type ComputedRef, type Ref } from "vue"
import { bindable } from "./bindable"
import { useRefs } from "./refs"
import { useTrack } from "./track"

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

export function useMachine<T extends MachineSchema>(
  machine: Machine<T>,
  userProps: MaybeRef<Partial<T["props"]>> = {},
): Service<T> {
  const scope = __computed(() => {
    const { id, ids, getRootNode } = toValue(userProps) as any
    return createScope({ id, ids, getRootNode })
  })

  const debug = (...args: any[]) => {
    if (machine.debug) console.log(...args)
  }

  const props: any = __computed(
    () =>
      machine.props?.({
        props: compact(toValue(userProps)),
        get scope() {
          return scope.value
        },
      }) ?? toValue(userProps),
  )

  const prop = useProp<any>(props)

  const context: any = machine.context?.({
    prop,
    bindable,
    get scope() {
      return scope.value
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
      return !!machine.states[currentState as T["state"]]?.tags?.includes(tag)
    },
  })

  const refs = useRefs(machine.refs?.({ prop, context: ctx }) ?? {})

  const getParams = (): any => ({
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
    get scope() {
      return scope.value
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

  const computed: ComputedFn<T> = (key) => {
    ensure(machine.computed, () => `[zag-js] No computed object found on machine`)
    const fn = machine.computed[key]
    return fn({
      context: ctx as any,
      event: getEvent(),
      prop,
      refs,
      get scope() {
        return scope.value
      },
      computed: computed as any,
    })
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
    },
  }))

  let status = MachineStatus.NotStarted

  onMounted(() => {
    const started = status === MachineStatus.Started
    status = MachineStatus.Started
    debug(started ? "rehydrating..." : "initializing...")
    state.invoke(state.initial!, INIT_STATE)
  })

  onBeforeUnmount(() => {
    status = MachineStatus.Stopped
    debug("unmounting...")

    const fns = effects.values()
    for (const fn of fns) fn?.()
    effects = new Map()
    action(machine.exit)
  })

  const send = (event: any) => {
    if (status !== MachineStatus.Started) return

    previousEventRef.current = eventRef.current
    eventRef.current = event

    debug("send", event)

    let currentState = state.get()

    const transitions =
      //@ts-expect-error
      machine.states[currentState].on?.[event.type] ?? machine.on?.[event.type]

    const transition = choose(transitions)
    if (!transition) return

    // save current transition
    transitionRef = transition
    const target = transition.target ?? currentState

    debug("transition", transition)

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
    get scope() {
      return scope.value
    },
    refs,
    computed,
    event: getEvent(),
    getStatus: () => status,
  } as Service<T>
}

function useProp<T>(valueRef: Ref<T>) {
  return function get<K extends keyof T>(key: K): T[K] {
    return valueRef.value[key]
  }
}

const flush = (fn: VoidFunction) => {
  nextTick().then(() => {
    fn()
  })
}
