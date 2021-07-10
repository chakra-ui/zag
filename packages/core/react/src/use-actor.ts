import { AnyMachine, StateMachine as S } from "@ui-machines/core"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useConstant } from "./use-constant"

const useSafeLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect

export function useActor<T extends AnyMachine>(service: T) {
  const ref = useRef(service)
  const [current, setCurrent] = useState(() => service.state)

  const send = useConstant(() => (event: S.Event<S.AnyEventObject>) => {
    ref.current.send(event)
  })

  useSafeLayoutEffect(() => {
    ref.current = service
    return service.subscribe((state) => {
      setCurrent(state)
    })
  }, [service])

  return [current as T["state"], send] as const
}
