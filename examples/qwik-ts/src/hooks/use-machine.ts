import { $, NoSerialize, QRL, Signal } from "@builder.io/qwik"
import type { Machine, StateMachine as S } from "@zag-js/core"
import { useService } from "./use-service"
import { useSnapshot } from "./use-snapshot"

interface UseMachineOptions<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
> {
  qrl: () => Promise<NoSerialize<Machine<TContext, TState, TEvent>>>
  initialState: NoSerialize<S.State<TContext, TState>>
}

type UseMachineReturn<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
> = [
  Signal<NoSerialize<S.State<TContext, TState>> | null>,
  QRL<(event: TEvent | string) => void>,
  Signal<NoSerialize<Machine<TContext, TState, TEvent>> | null>,
]

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
>(
  props: UseMachineOptions<TContext, TState, TEvent>,
  options?: S.HookOptions<TContext, TState, TEvent>,
): UseMachineReturn<TContext, TState, TEvent> {
  const service = useService(props, options)
  const state = useSnapshot(service, options, props.initialState)

  const send = $((event: TEvent | string) => {
    service.value?.send(event)
  })

  return [state, send, service]
}
