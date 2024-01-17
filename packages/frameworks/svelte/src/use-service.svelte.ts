import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { unstate } from "svelte"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { state: hydratedState, context } = options ?? {}

  const machine_ = typeof machine === "function" ? machine() : machine
  const service = context ? machine_.withContext(unstate(context)) : machine_

  $effect(() => {
    service.start(hydratedState)
    return service.stop
  })

  return service
}
