import type { StateMachine as S } from "@ui-machines/core"
import { useEffect, useRef } from "react"

export type UseSetupProps = {
  send: (evt: S.Event<S.AnyEventObject>) => void
  id: string
}

export function useSetup<T extends HTMLElement = HTMLDivElement>(props: UseSetupProps) {
  const { send, id } = props
  const ref = useRef<T>(null)

  useEffect(() => {
    Promise.resolve().then(() => {
      const doc = ref.current?.ownerDocument
      send({ type: "SETUP", doc, id })
    })
  }, [id])

  return ref
}
