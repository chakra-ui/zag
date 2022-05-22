import type { StateMachine as S } from "@zag-js/core"
import { useEffect, useRef } from "react"

export type UseSetupProps = {
  send: (evt: S.Event<S.AnyEventObject>) => void
  id: string
}

export function useSetup<T extends HTMLElement = HTMLDivElement>(props: UseSetupProps) {
  const { send, id } = props
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!id) return

    const el = ref.current
    const doc = el?.ownerDocument
    const root = el?.getRootNode()

    send({ type: "SETUP", doc, root, id })
  }, [id])

  return ref
}
