import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { cast } from "@zag-js/utils"
import { useEffect, useLayoutEffect } from "react"
import { useSnapshot } from "valtio"
import { useConstant } from "./use-constant"

const useSafeLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect

/**
 * Useful for `React.Context` consumers who need to start the machine at the root level
 * and propagate the `service` down to children.
 *
 * It returns a stable instance of the machine
 */
export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { actions, state: hydratedState, context } = options ?? {}

  const service = useConstant(() => {
    const _machine = typeof machine === "function" ? machine() : machine
    return context ? _machine.withContext(context) : _machine
  })

  useSafeLayoutEffect(() => {
    service.start(hydratedState)
    return () => {
      service.stop()
    }
  }, [])

  useSafeLayoutEffect(() => {
    service.setActions(actions)
  }, [actions])

  useSafeLayoutEffect(() => {
    if (!context) return
    service.setContext(context)
  }, [context])

  return service
}

/**
 * General purpose hook for consuming UI machines within react.
 *
 * It returns a tuple that contains:
 * - `state`: the current state of the machine
 * - `send`: function to send events to the machine
 * - `service`: the machine instance or service
 */
export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const service = useService(machine, options)

  const state = cast<S.State<TContext, TState, TEvent>>(
    useSnapshot(service.state, {
      sync: service.options.hookSync,
    }),
  )

  return [state, service.send, service] as const
}
