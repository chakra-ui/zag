import { MachineSrc, StateMachine as S } from "@ui-machines/core"
import { useEffect, useLayoutEffect } from "react"
import { useSnapshot } from "valtio"
import { useConstant } from "./use-constant"

const useSafeLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { actions, state: hydratedState, context } = options ?? {}

  const service = useConstant(() => {
    const resolvedMachine = typeof machine === "function" ? machine() : machine.clone()
    return options ? resolvedMachine.withOptions(options) : resolvedMachine
  })

  useSafeLayoutEffect(() => {
    service.start(hydratedState)
    return () => void service.stop()
  }, [service])

  useSafeLayoutEffect(() => {
    service.setActions(actions)
  }, [actions])

  useSafeLayoutEffect(() => {
    if (!context) return
    service.setContext(context)
  }, [context])

  const state = useSnapshot(service.state)
  const _state = <S.State<TContext, TState>>state

  return [_state, service.send, service] as const
}
