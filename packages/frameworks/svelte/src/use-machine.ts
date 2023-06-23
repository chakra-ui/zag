import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { onMount } from "svelte"
import { get, writable } from "svelte/store"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: any) {
  const { actions, state: hydratedState, context } = options ?? {}
  const _machine = typeof machine === "function" ? machine() : machine
  const service = get(context) ? _machine.withContext(get(context)) : _machine

  onMount(() => {
    service.start(hydratedState)

    if (service.state.can("SETUP")) {
      service.send("SETUP")
    }

    return () => {
      service.stop()
    }
  })

  service.setOptions({ actions })

  context.subscribe((nextContext: TContext) => {
    service.setContext(nextContext)
  })

  return service
}

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: any) {
  const service = useService(machine, options)

  const state = writable(service.state)

  onMount(() => {
    const unsubscribe = service.subscribe((nextState) => {
      state.set(nextState)
    })

    return () => {
      unsubscribe?.()
    }
  })

  return [state, service.send, service] as const
}
