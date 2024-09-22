import { $ } from "@builder.io/qwik"
import type { StateMachine as S } from "@zag-js/core"
import { useService } from "./use-service"
import { useSnapshot } from "./use-snapshot"
import type { UseMachineOptions, UseMachineReturn } from "./types"

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
