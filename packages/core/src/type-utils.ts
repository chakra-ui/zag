import type { Machine } from "./machine"
import type { StateMachine as S } from "./types"

type AnyFunction = (...args: any[]) => any
type ReturnTypeOrValue<T> = T extends AnyFunction ? ReturnType<T> : T

export type StateFrom<T> =
  ReturnTypeOrValue<T> extends infer R
    ? R extends Machine<infer TContext, infer TState, infer TEvent>
      ? S.State<TContext, TState, TEvent>
      : never
    : never

export type ContextFrom<T> =
  ReturnTypeOrValue<T> extends infer R ? (R extends Machine<infer TContext, any, any> ? TContext : never) : never

export type EventFrom<T> =
  ReturnTypeOrValue<T> extends infer R ? (R extends Machine<any, any, infer TEvent> ? TEvent : never) : never
