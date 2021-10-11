import type { MachineSrc, StateMachine as S } from "@ui-machines/core"
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from "vue"

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  /** Machine options */
  const { actions, state: hydratedState, context } = options ?? {}

  const resolvedMachine = typeof machine === "function" ? machine() : machine.clone()
  const service = options ? resolvedMachine.withOptions(options) : resolvedMachine

  /**
   * The `state` variable holds the internal
   * state for this machine instance.
   *
   * The `consumableState` computed variable will
   * compare new values in it's setter before writing
   * to the `state` ref.
   */
  const state = shallowRef<S.State<TContext, TState>>(service.state)
  const consumableState = computed({
    get() {
      return state.value
    },
    set(value: S.State<TContext, TState>) {
      if (state.value !== value) {
        state.value = value
      }
    },
  })

  /** Initialize machine service */
  service.start(hydratedState)
  let unsubscribe: () => void

  onMounted(() => {
    unsubscribe = service.subscribe(listener)
  })

  watch(() => actions, service.setActions, { flush: "post", immediate: true })

  watch(
    () => context,
    (newVal) => {
      if (newVal) service.setContext(newVal)
    },
    { immediate: true },
  )

  /**
   * Here we use this listener to write the updated
   * state from the state machine to a writable computed ref.
   *
   * The reason for this that Vue will only re-initialize
   * this hook once during setup unlike her react counterpart which uses snapshots.
   *
   * So in order to keep track of the update state, we use a shallowRef
   * to write and compare the current and only push updates when the state
   * has changed.
   */
  function listener(nextState: S.State<TContext, TState>) {
    consumableState.value = nextState
  }

  // Cleanup
  onBeforeUnmount(() => {
    unsubscribe?.()
    service.stop()
  })

  return [consumableState, service.send, service] as const
}
