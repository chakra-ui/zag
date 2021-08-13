import { runIfFn } from "@core-foundation/utils/fn"
import { computed, onMounted, watch, onBeforeUnmount, shallowRef } from "vue"
import { MachineSrc, StateMachine as S } from "@ui-machines/core"

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(
  machine: MachineSrc<TContext, TState, TEvent>,
  options?: S.MachineOptions<TContext, TState, TEvent> & {
    state?: S.StateInit<TContext, TState>
  },
) {
  /** Machine options */
  const { actions, state: hydratedState } = options ?? {}

  const resolvedMachine = runIfFn(machine)
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

  watch(
    () => actions,
    (newVal) => {
      service.updateActions(newVal)
    },
    {
      flush: "post",
      immediate: true,
    },
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
    service.stop()
    unsubscribe?.()
  })

  return [consumableState, service.send, service] as const
}
