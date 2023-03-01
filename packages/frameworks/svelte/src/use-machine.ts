import { onDestroy } from "svelte/internal"
import type { MachineSrc, StateMachine as S } from "@zag-js/core"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: any) {
  const { actions, state: hydratedState } = options !== null && options !== void 0 ? options : {}

  const _machine = typeof machine === "function" ? machine() : machine
  const service = _machine.start(hydratedState)

  service.setOptions({ actions })

  return service
}

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.MachineOptions<TContext, TState, TEvent>) {
  const service = useService(machine, options)

  const state = { subscribe: service.subscribe }

  onDestroy(() => {
    service.stop()
  })

  return [state, service.send] as const
}
