import { subscribe, type Machine, type StateMachine as S, snapshot } from "@zag-js/core"
import { onDestroy } from "svelte"

export function useSnapshot<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>) {
  //

  let state = $state(service.state)

  const unsubscribe = subscribe(service.state, () => {
    state = snapshot(service.state) as any
  })

  onDestroy(unsubscribe)

  return {
    // Need a getter to get fresh state.
    get state() {
      return state
    },
  }
}
