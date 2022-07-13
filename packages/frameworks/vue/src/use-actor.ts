import type { Machine, StateMachine as S } from "@zag-js/core"
import { onBeforeUnmount, onMounted, readonly, shallowRef } from "vue"

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>) {
  const state = shallowRef(service.state)

  onMounted(() => {
    const unsubscribe = service.subscribe((nextState) => {
      state.value = nextState
    })

    onBeforeUnmount(() => {
      unsubscribe?.()
    })
  })

  return [readonly(state), service.send] as const
}
