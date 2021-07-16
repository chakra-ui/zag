import { AnyFunction } from "@ui-machines/utils/function"
import { useId } from "@reach/auto-id"
import { useEffect, useRef } from "react"

export function useMount<T extends HTMLElement = HTMLElement>(
  send: AnyFunction,
) {
  const ref = useRef<T>(null)
  const id = useId()

  useEffect(() => {
    if (!id) return
    send({ type: "SETUP", doc: ref.current?.ownerDocument, id })
  }, [send, id])

  return ref
}
