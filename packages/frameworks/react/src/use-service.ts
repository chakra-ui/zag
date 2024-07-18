import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { useRef } from "react"
import { useConstant } from "./use-constant"
import { useSafeLayoutEffect } from "./use-layout-effect"
import { isDev } from "@zag-js/utils"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { state: hydratedState, context } = options ?? {}

  const service = useConstant(() => {
    const instance = typeof machine === "function" ? machine() : machine
    if (context) instance.setContext(context)
    instance._created()
    return instance
  })

  const snapshotRef = useRef<S.StateInit<TContext, TState>>()

  useSafeLayoutEffect(() => {
    const stateInit = hydratedState ?? snapshotRef.current
    service.start(stateInit)
    return () => {
      // HMR improvements for dev
      if (isDev()) {
        snapshotRef.current = service.getHydrationState()
      }
      service.stop()
    }
  }, [])

  return service
}
