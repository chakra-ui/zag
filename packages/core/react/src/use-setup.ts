import { AnyFunction } from "@core-foundation/utils/fn"
import { useEffect, useRef } from "react"

export type UseSetupProps = {
  send: AnyFunction
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
