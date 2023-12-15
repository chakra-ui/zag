import type { Machine, StateMachine as S } from "@zag-js/core"
import { snapshot, subscribe } from "@zag-js/store"
import { onUnmounted, shallowRef, watch, watchEffect, type Ref } from "vue"

export function useSnapshot<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>, options?: any): Ref<S.State<TContext, TState, TEvent>> {
  //
  const { actions, context } = options ?? {}

  const state = shallowRef(service.state)

  const unsubscribe = subscribe(service.state, () => {
    state.value = snapshot(service.state) as any
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  watchEffect(() => {
    service.setOptions({ actions })
  })

  if (context) {
    watch(context, service.setContext, { deep: true })
  }

  return state
}
