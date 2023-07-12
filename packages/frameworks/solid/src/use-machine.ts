import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { createEffect, onCleanup, onMount, type Accessor } from "solid-js"
import { createStore, reconcile, type Store } from "solid-js/store"

type HookOptions<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
> = Omit<S.HookOptions<TContext, TState, TEvent>, "context"> & {
  context?: Store<Partial<TContext>> | Accessor<Partial<TContext>>
}

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: HookOptions<TContext, TState, TEvent>) {
  const { actions, state: hydratedState, context } = options ?? {}

  const service = (() => {
    const _machine = typeof machine === "function" ? machine() : machine
    const contextValue = typeof context === "function" ? context() : context
    return contextValue ? _machine.withContext(contextValue) : _machine
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
    const contextValue = typeof context === "function" ? context() : context
    service.setContext(contextValue)
  })

  createEffect(() => {
    service.setOptions({ actions })
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
