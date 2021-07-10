import { AnyFunction } from "@chakra-ui/utilities"
import { useId } from "@reach/auto-id"
import { useEffect, useRef } from "react"

export function useMount<T extends HTMLElement = HTMLElement>(
  send: AnyFunction,
) {
  const ref = useRef<T>(null)
  const id = useId()

  useEffect(() => {
    if (!id) return
    send({ type: "MOUNT", doc: ref.current?.ownerDocument, id })
  }, [send, id])

  return ref
}
