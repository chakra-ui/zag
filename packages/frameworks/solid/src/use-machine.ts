import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { createEffect, onCleanup, onMount } from "solid-js"
import { createStore, reconcile, Store } from "solid-js/store"

type HookOptions<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
> = Omit<S.HookOptions<TContext, TState, TEvent>, "context"> & {
  context?: Store<Partial<TContext>>
}

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: HookOptions<TContext, TState, TEvent>) {
  const { actions, state: hydratedState, context } = options ?? {}

  const service = (() => {
    const _machine = typeof machine === "function" ? machine() : machine
    return context ? _machine.withContext(compact(context)) : _machine
  })()

  onMount(() => {
    service.start(hydratedState)

    if (service.state.can("SETUP")) {
      service.send("SETUP")
    }

    onCleanup(() => {
      service.stop()
    })
  })

  createEffect(() => {
    service.setContext(compact(context))
  })

  createEffect(() => {
    service.setActions(actions)
  })

  return service
}

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: HookOptions<TContext, TState, TEvent>) {
  const service = useService(machine, options)

  const [state, setState] = createStore(service.getState())

  onMount(() => {
    const unsubscribe = service.subscribe((nextState) => {
      setState(reconcile(nextState))
    })

    onCleanup(() => {
      unsubscribe()
    })
  })

  return [state, service.send, service] as const
}
