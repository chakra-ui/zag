import type { StateMachine as S } from "@ui-machines/core"
import { useEffect, useRef } from "react"

export type UseSetupProps = {
  send: (evt: S.Event<S.AnyEventObject>) => void
  id: string
}

export function useSetup<T extends HTMLElement = HTMLElement>(props: UseSetupProps) {
  const { send, id } = props
  const ref = useRef<T>(null)

  useEffect(() => {
    send({ type: "SETUP", doc: ref.current?.ownerDocument, id })
  }, [id])

  return ref
}
