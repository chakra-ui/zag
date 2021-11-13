import type { Machine, StateMachine as S } from "@ui-machines/core"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useConstant } from "./use-constant"

const useSafeLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>) {
  const ref = useRef(service)
  const [current, setCurrent] = useState(() => service.state)

  const send = useConstant(() => (event: TEvent) => {
    ref.current.send(event)
  })

  useSafeLayoutEffect(() => {
    ref.current = service
    return service.subscribe((state) => {
      setCurrent(state)
    })
  }, [service])

  return [current, send] as const
}
