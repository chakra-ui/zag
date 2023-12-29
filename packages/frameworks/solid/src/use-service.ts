import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { onCleanup, onMount } from "solid-js"
import type { MachineOptions } from "./types"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: MachineOptions<TContext, TState, TEvent>) {
  const { state: hydratedState, context } = options ?? {}

  const service = (() => {
    const _machine = typeof machine === "function" ? machine() : machine
    const contextValue = typeof context === "function" ? context() : context
    return contextValue ? _machine.withContext(contextValue) : _machine
  })()

  onMount(() => {
    service.start(hydratedState)

    onCleanup(() => {
      service.stop()
    })
  })

  return service
}
