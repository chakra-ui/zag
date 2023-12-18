import type { Machine, StateMachine as S } from "@zag-js/core"
import { createEffect, onCleanup, onMount } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import type { MachineOptions } from "./types"

export function useSnapshot<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>, options?: MachineOptions<TContext, TState, TEvent>) {
  const { actions, context } = options ?? {}

  const [state, setState] = createStore(service.getState())

  onMount(() => {
    const unsubscribe = service.subscribe((nextState) => {
      setState(reconcile(nextState))
    })

    onCleanup(() => {
      unsubscribe()
    })
  })

  createEffect(() => {
    const contextValue = typeof context === "function" ? context() : context
    service.setContext(contextValue)
  })

  createEffect(() => {
    service.setOptions({ actions })
  })

  return state
}
