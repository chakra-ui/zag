import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { type WebContext } from "brisa"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(ctx: WebContext, machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { state: hydratedState, context } = options ?? {}

  const service = (() => {
    const instance = typeof machine === "function" ? machine() : machine
    if (context) instance.setContext(context)
    instance._created()
    return instance
  })()

  ctx.onMount(() => {
    service.start(hydratedState)
  })
  ctx.cleanup(() => {
    service.stop()
  })

  return service
}
