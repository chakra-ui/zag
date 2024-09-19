import type { Machine, StateMachine as S } from "@zag-js/core"
import { useSnapshot } from "./use-snapshot"
import { $, NoSerialize, Signal } from "@builder.io/qwik"

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Signal<NoSerialize<Machine<TContext, TState, TEvent>> | null>) {
  const state = useSnapshot(service)

  const send = $((event: TEvent | string) => {
    service.value?.send(event)
  })

  return [state, send] as const
}
