import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { useService } from "./use-service.svelte.js"
import { useSnapshot } from "./use-snapshot.svelte.js"

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const service = useService(machine, options)
  const snapshot = useSnapshot(service, options)

  return {
    send: service.send,
    service,
    // Need a getter to get fresh state.
    get state() {
      return snapshot.state
    },
  } as const
}
