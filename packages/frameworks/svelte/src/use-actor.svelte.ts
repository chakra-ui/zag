import type { Machine, StateMachine as S } from "@zag-js/core"
import { useSnapshot } from "./use-snapshot.svelte.js"

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>) {
  const snapshot = useSnapshot(service)

  return {
    send: service.send,
    // Need a getter to get fresh state.
    get state() {
      return snapshot.state
    },
  } as const
}
