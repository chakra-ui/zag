import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { useService } from "./use-service"
import { useSnapshot } from "./use-snapshot"
import type { WebContext } from "brisa"

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(ctx: WebContext, machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const service = useService(ctx, machine, options)
  const state = useSnapshot(ctx, service, options)
  return [state, service.send, service] as const
}
