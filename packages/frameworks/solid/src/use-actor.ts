import type { Machine, StateMachine as S } from "@zag-js/core"
import { onCleanup, onMount } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import { unwrap } from "./unwrap"

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>) {
  const [state, setState] = createStore(unwrap(service.state))

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
