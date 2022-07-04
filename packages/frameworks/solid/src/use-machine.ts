import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { createEffect, onCleanup, onMount } from "solid-js"
import { createStore, reconcile, Store } from "solid-js/store"
import { unwrap } from "./unwrap"

type HookOptions<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
> = Omit<S.HookOptions<TContext, TState, TEvent>, "context"> & {
  context?: Store<Partial<TContext>>
}

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: HookOptions<TContext, TState, TEvent>) {
  const { actions, state: hydratedState, context } = options ?? {}
  const service = typeof machine === "function" ? machine() : machine

  const [state, setState] = createStore<any>(unwrap(service.state))

  service.start(hydratedState)

  createEffect(() => {
    if (context) {
      service.setContext(context)
    }
  })

  const unsubscribe = service.subscribe((s) => {
    setState(reconcile(s))
  })

  onCleanup(() => {
    unsubscribe()
    service.stop()
  })

  onMount(() => {
    service.setActions(actions)
  })

  const _state = <S.State<TContext, TState>>state

  return [_state, service.send, service] as const
}
