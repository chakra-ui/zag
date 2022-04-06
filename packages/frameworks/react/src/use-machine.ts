import { MachineSrc, StateMachine as S } from "@zag-js/core"
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
  const { actions, state: hydratedState, context, preserve } = options ?? {}

  const service = useConstant(() => {
    const resolvedMachine = typeof machine === "function" ? machine() : preserve ? machine : machine.clone()
    return options ? resolvedMachine.withOptions(options) : resolvedMachine
  })

  useSafeLayoutEffect(() => {
    service.start(hydratedState)
    return () => {
      service.stop()
    }
  }, [service])

  useSafeLayoutEffect(() => {
    service.setActions(actions)
  }, [actions])

  useSafeLayoutEffect(() => {
    if (!context) return
    service.setContext(context)
  }, [context])

  return service
}

type SyncOption = {
  /**
   * Whether to execute state update synchronously within `valtio`
   * @see Valtio https://github.com/pmndrs/valtio#update-synchronously
   */
  sync?: boolean
}

/**
 * General purpose hook for consuming UI machines within react.
 *
 * It returns a tuple that contains:
 * - `state`: the current state of the machine
 * - `send`: function to send events to the machine
 * - `service`: the machine instance or service
 *
 * **NOTE**: For context usage, we recommend using `useService` and `useActor` hooks instead.
 */
export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent> & SyncOption) {
  const { sync, ...hookOptions } = options ?? {}
  const service = useService(machine, hookOptions)
  const state = cast<S.State<TContext, TState, TEvent>>(useSnapshot(service.state, { sync }))
  return [state, service.send, service] as const
}
