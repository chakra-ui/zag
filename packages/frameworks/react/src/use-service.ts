import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { useConstant } from "./use-constant"
import { useSafeLayoutEffect } from "./use-layout-effect"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { state: hydratedState, context } = options ?? {}

  const service = useConstant(() => {
    const instance = typeof machine === "function" ? machine() : machine
    return context ? instance.withContext(context) : instance
  })

  useSafeLayoutEffect(() => {
    service.start(hydratedState)
    return () => {
      service.stop()
    }
  }, [])

  return service
}
