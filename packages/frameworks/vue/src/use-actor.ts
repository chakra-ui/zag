import type { Machine, StateMachine as S } from "@zag-js/core"
import { useSnapshot } from "./use-snapshot"

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>) {
  const state = useSnapshot(service)
  return [state, service.send] as const
}
