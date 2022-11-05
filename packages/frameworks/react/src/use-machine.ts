import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { useEffect, useLayoutEffect, useRef } from "react"
import { useSnapshot } from "./use-snapshot"

const useSafeLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect

function useConstant<T>(fn: () => T): T {
  const ref = useRef<{ v: T }>()
  if (!ref.current) ref.current = { v: fn() }
  return ref.current.v
}

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { actions, state: hydratedState, context } = options ?? {}

  const service = useConstant(() => {
    const _machine = typeof machine === "function" ? machine() : machine
    return context ? _machine.withContext(compact(context)) : _machine
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

  useSafeLayoutEffect(() => {
    service.setActions(actions)
    service.setContext(compact(context))
  }, [context, actions])

  return service
}

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const service = useService(machine, options)

  const state = useSnapshot(service.state, {
    sync: service.options.hookSync,
  })

  const typedState = state as unknown as S.State<TContext, TState, TEvent>

  return [typedState, service.send, service] as const
}
