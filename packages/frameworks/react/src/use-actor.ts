import type { Machine, StateMachine as S } from "@zag-js/core"
import { useSnapshot } from "./use-snapshot"

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>) {
  const current = useSnapshot(service.state)
  const typedState = current as unknown as S.State<TContext, TState, TEvent>
  return [typedState, service.send] as const
}
