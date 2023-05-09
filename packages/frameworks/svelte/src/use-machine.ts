import { onMount } from "svelte/internal"
import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { Readable, derived, writable } from "svelte/store"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { actions, state: hydratedState, context } = options ?? {}
  const _machine = typeof machine === "function" ? machine() : machine
  const service = context ? _machine.withContext(context) : _machine

  onMount(() => {
    service.start(hydratedState)

    if (service.state.can("SETUP")) {
      service.send("SETUP")
    }

    if (context) {
      const nonreactiveContext = {}
      Object.entries(context).forEach(([key, value]: any[]) => {
        if (key && !value?.hasOwnProperty("subscribe")) {
          nonreactiveContext[key] = value
        }
      })

      const contextStores = Object.entries(context)
        .filter(([, value]: any[]) => value?.hasOwnProperty("subscribe"))
        .map(([, value]) => value) as Readable<any>[]

      // Subscribing to store to create new Context
      derived(contextStores, (values) => values).subscribe((values) => {
        const contextKeys = Object.keys(context)
        const newStoreContextValues = {}
        values.forEach((val, index) => {
          newStoreContextValues[contextKeys[index]] = val
        })
        const newContext: any = { ...nonreactiveContext, ...newStoreContextValues }

        service.setContext(newContext)
      })
    }

    return () => {
      service.stop()
    }
  })

  service.setOptions({ actions })

  return service
}

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
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
