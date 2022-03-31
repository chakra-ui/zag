import type { StateMachine as S } from "@ui-machines/core"
import { useEffect, useLayoutEffect, useRef } from "react"

export type UseSetupProps = {
  send: (evt: S.Event<S.AnyEventObject>) => void
  id: string
}

const useSafeLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect

export function useSetup<T extends HTMLElement = HTMLDivElement>(props: UseSetupProps) {
  const { send, id } = props
  const ref = useRef<T>(null)

  useSafeLayoutEffect(() => {
    Promise.resolve().then(() => {
      const doc = ref.current?.ownerDocument
      send({ type: "SETUP", doc, id })
    })
  }, [id])

  return ref
}
