import { Machine, StateMachine as S } from "@ui-machines/core"
import { cast } from "@ui-machines/utils"
import { useSnapshot } from "valtio"

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>, options: { sync?: boolean } = {}) {
  const { sync } = options
  const current = cast<S.State<TContext, TState, TEvent>>(useSnapshot(service, { sync }))
  return [current, service.send] as const
}
