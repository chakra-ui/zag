import type { Machine, StateMachine as S } from "@zag-js/core"
import { onCleanup, onMount } from "solid-js"
import { createStore, reconcile } from "solid-js/store"

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>) {
  const [state, setState] = createStore(service.getState())

  onMount(() => {
    const unsubscribe = service.subscribe((nextState) => {
      setState(reconcile(nextState))
    })

    onCleanup(() => {
      unsubscribe()
    })
  })

  return [state, service.send] as const
}
