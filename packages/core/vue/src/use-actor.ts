import type { AnyMachine, StateMachine as S } from "@ui-machines/core"
import { computed, onBeforeUnmount, onMounted, shallowRef } from "vue"

/**
 * The `useActor` hook is a composable used by a component to consume the
 * state and manage the events of an actor within a state machine context.
 *
 * `useActor` accepts a service as it's argument, and will update it's context
 * with state updates from the spawned actor.
 *
 * It can also be used to send events to the parent state machine.
 * See the `toast` page in the `vue-ts` example to see how it's used.
 */
export function useActor<T extends AnyMachine>(service: T) {
  /**
   * See `useMachine()` to to see why we use a `shallowRef`
   * and `computed` together to preserve state.
   */
  const state = shallowRef(service.state)
  const consumableState = computed<T["state"]>({
    get() {
      return state.value
    },
    set(value: S.State<any, any>) {
      if (state.value !== value) {
        state.value = value
      }
    },
  })

  let unsubscribe: () => void

  /**
   * See `useMachine()` to to see why we use a `listener`
   * function to watch for state updates in actors
   */
  function listener(nextState: S.State<any, any>) {
    consumableState.value = nextState
  }

  onMounted(() => {
    unsubscribe = service.subscribe(listener)
  })

  // Cleanup
  onBeforeUnmount(() => {
    unsubscribe?.()
  })

  return [consumableState, service.send] as const
}
