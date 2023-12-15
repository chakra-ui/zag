import type { StateMachine as S } from "@zag-js/core"
import { type Accessor } from "solid-js"
import { type Store } from "solid-js/store"

export type MachineOptions<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
> = Omit<S.HookOptions<TContext, TState, TEvent>, "context"> & {
  context?: Store<Partial<TContext>> | Accessor<Partial<TContext>>
}
