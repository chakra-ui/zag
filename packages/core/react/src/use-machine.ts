import { cast } from "@core-foundation/utils/fn"
import { MachineSrc, StateMachine as S } from "@ui-machines/core"
import { useEffect, useLayoutEffect } from "react"
import { useSnapshot } from "valtio"
import { useConstant } from "./use-constant"

const useSafeLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(
  machine: MachineSrc<TContext, TState, TEvent>,
  options?: S.MachineOptions<TContext, TState, TEvent> & {
    state?: S.StateInit<TContext, TState>
  },
) {
  const { actions, state: hydratedState } = options ?? {}
  const service = useConstant(() => {
    const resolvedMachine = typeof machine === "function" ? machine() : machine.clone()
    return options ? resolvedMachine.withOptions(options) : resolvedMachine
  })

  useSafeLayoutEffect(() => {
    service.start(hydratedState)
    return () => void service.stop()
  }, [service])

  useSafeLayoutEffect(() => {
    service.updateActions(actions)
  }, [actions])

  const state = useSnapshot(service.state)
  const _state = cast<S.State<TContext, TState>>(state)

  return [_state, service.send, service] as const
}
