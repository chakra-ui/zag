import type { Machine, StateMachine as S } from "@zag-js/core"
import { cast } from "@zag-js/utils"
import { useSnapshot } from "./use-snapshot"

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>) {
  const current = cast<S.State<TContext, TState, TEvent>>(
    useSnapshot(service.state, {
      sync: service.options.hookSync,
    }),
  )
  return [current, service.send] as const
}
