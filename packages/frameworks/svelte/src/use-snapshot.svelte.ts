import { subscribe, type Machine, type StateMachine as S, snapshot } from "@zag-js/core"
import { onDestroy, unstate } from "svelte"

export function useSnapshot<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  //
  const { actions, context } = options ?? {}

  let state = $state(service.state)

  const unsubscribe = subscribe(service.state, () => {
    state = snapshot(service.state) as any
  })

  onDestroy(unsubscribe)

  $effect(() => {
    service.setOptions({ actions: unstate(actions) })
  })

  $effect(() => {
    service.setContext(unstate(context))
  })

  return {
    // Need a getter to get fresh state.
    get state() {
      return state
    },
  }
}
