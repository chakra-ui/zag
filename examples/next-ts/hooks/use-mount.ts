import { StateMachine as S } from "@ui-machines/core"
import { useId } from "@reach/auto-id"
import { useEffect, useRef } from "react"

export function useMount<T extends HTMLElement = HTMLElement>(send: (evt: S.Event<S.AnyEventObject>) => void) {
  const ref = useRef<T>(null)
  const id = useId()

  useEffect(() => {
    if (!id) return
    send({ type: "SETUP", doc: ref.current?.ownerDocument, id })
  }, [send, id])

  return ref
}
