import type { NoSerialize, QRL, Signal } from "@builder.io/qwik"
import type { Machine, StateMachine as S } from "@zag-js/core"

export interface UseMachineOptions<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
> {
  qrl: () => Promise<NoSerialize<Machine<TContext, TState, TEvent>>>
  initialState: NoSerialize<S.State<TContext, TState>>
}

export type UseMachineReturn<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
> = [
  Signal<NoSerialize<S.State<TContext, TState>> | null>,
  QRL<(event: TEvent | string) => void>,
  Signal<NoSerialize<Machine<TContext, TState, TEvent>> | null>,
]
