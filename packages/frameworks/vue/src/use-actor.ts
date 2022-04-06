import type { Machine, StateMachine as S } from "@zag-js/core"
import { computed, onBeforeUnmount, onMounted, shallowRef } from "vue"

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>) {
  /**
   * See `useMachine()` to to see why we use a `shallowRef`
   * and `computed` together to preserve state.
   */
  const state = shallowRef(service.state)
  const consumableState = computed({
    get() {
      return state.value as S.State<TContext, TState, TEvent>
    },
    set(value: S.State<TContext, TState, TEvent>) {
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
  function listener(nextState: S.State<TContext, TState, TEvent>) {
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
