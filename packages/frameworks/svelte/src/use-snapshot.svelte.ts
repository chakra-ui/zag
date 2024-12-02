import { type Machine, type StateMachine as S } from "@zag-js/core"
import { onDestroy } from "svelte"
import { reflect } from "./reflect"

export function useSnapshot<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>) {
  let state = $state(service.state)

  const unsubscribe = service.subscribe((nextState) => {
    state = nextState
  })

  onDestroy(unsubscribe)

  return reflect(() => state)
}
