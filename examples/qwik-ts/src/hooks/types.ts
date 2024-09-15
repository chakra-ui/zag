import type { StateMachine as S } from "@zag-js/core"

export type MachineOptions<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
> = Omit<S.HookOptions<TContext, TState, TEvent>, "context"> & {
  context?: Partial<TContext> | (() => Partial<TContext>)
}
