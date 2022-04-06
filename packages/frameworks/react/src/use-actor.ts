import { Machine, StateMachine as S } from "@zag-js/core"
import { cast } from "@zag-js/utils"
import { useSnapshot } from "valtio"

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>, options: { sync?: boolean } = {}) {
  const { sync } = options
  const current = cast<S.State<TContext, TState, TEvent>>(useSnapshot(service.state, { sync }))
  return [current, service.send] as const
}
