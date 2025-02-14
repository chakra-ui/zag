import {
  createScope,
  type ActionsOrFn,
  type BaseSchema,
  type BindableContext,
  type ChooseFn,
  type ComputedFn,
  type EffectsOrFn,
  type GuardFn,
  type MachineConfig,
  type Service,
} from "@zag-js/core"
import { isFunction, isString, toArray, warn } from "@zag-js/utils"
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  unref,
  computed as vueComputed,
  watch,
  type ComputedRef,
  type Ref,
} from "vue"
import { bindable } from "./bindable"
import { useRefs } from "./refs"
import { useTrack } from "./track"

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

export function useMachine<T extends BaseSchema>(
  machine: MachineConfig<T>,
  userProps: MaybeRef<Partial<T["props"]>> = {},
): Service<T> {
  const scope = vueComputed(() => {
    const { id, ids, getRootNode } = unref(userProps) as any
    return createScope({ id, ids, getRootNode })
  })

  const props: any = vueComputed(
    () => machine.props?.({ props: unref(userProps), scope: scope.value }) ?? unref(userProps),
  )

  const prop = useProp<any>(props)

  const context: any =
    machine.context?.({
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
    }) ?? {}

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

  let previousEventRef: any = { current: null }
  let eventRef = { current: { type: "__init__" } }

  const getEvent = () => ({
    ...eventRef.current,
    current() {
      return eventRef.current
    },
    previous() {
      return previousEventRef.current
    },
  })

  const refs = useRefs(machine.refs?.({ prop, context: ctx }) ?? {})

  const getParams = (): any => ({
    state,
    context: ctx,
    get event() {
      return getEvent()
    },
    prop,
    send,
    action,
    guard,
    track: useTrack,
    refs,
    computed,
    flush,
    scope: scope.value,
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
        get event() {
          return getEvent()
        },
        prop,
        refs,
        get scope() {
          return scope.value
        },
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
      action(transitionRef?.actions)

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

  onMounted(() => {
    state.invoke(state.initial!, "__init__")
  })

  onBeforeUnmount(() => {
    const fns = effects.values()
    for (const fn of fns) fn?.()
    effects = new Map()
    // root exit actions
    action(machine.exit)
  })

  const getCurrentState = () => {
    if ("ref" in state) return state.ref.value
    //@ts-expect-error
    return state.get()
  }

  const send = (event: any) => {
    previousEventRef.current = eventRef.current
    eventRef.current = event

    let currentState = getCurrentState()

    const transitions =
      //@ts-expect-error
      machine.states[currentState].on?.[event.type] ?? machine.on?.[event.type]

    const transition = choose(transitions)
    if (!transition) return

    // save current transition
    transitionRef = transition
    const target = transition.target ?? currentState

    const changed = target !== currentState
    if (changed) {
      state.set(target)
    } else {
      // call transition actions
      action(transition.actions)
    }
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
    scope: scope.value,
    refs,
    computed,
    get event() {
      return getEvent()
    },
  } as Service<T>
}

function useProp<T>(valueRef: Ref<T>) {
  const _ref = useLiveRef(valueRef)
  return function get<K extends keyof T>(key: K): T[K] {
    return _ref.value[key]
  }
}

function useLiveRef<T>(value: Ref<T>) {
  const _ref = ref(value.value)
  watch(value, (v) => (_ref.value = v), { immediate: true })
  return _ref
}

const flush = (fn: VoidFunction) => {
  nextTick().then(() => {
    fn()
  })
}
