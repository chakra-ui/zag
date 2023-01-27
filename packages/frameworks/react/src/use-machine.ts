import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { useConstant } from "./use-constant"
import { useSafeLayoutEffect } from "./use-layout-effect"
import { useSnapshot } from "./use-snapshot"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { actions, state: hydratedState, context } = options ?? {}

  const service = useConstant(() => {
    const instance = typeof machine === "function" ? machine() : machine
    return context ? instance.withContext(context) : instance
  })

  useSafeLayoutEffect(() => {
    service.start(hydratedState)

    if (service.state.can("SETUP")) {
      service.send("SETUP")
    }

    return () => {
      service.stop()
    }
  }, [])

  service.setOptions({ actions })
  service.setContext(context)

  return service
}

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const service = useService(machine, options)

  const state = useSnapshot(service.state)
  const typedState = state as unknown as S.State<TContext, TState, TEvent>
  return [typedState, service.send, service] as const
}
