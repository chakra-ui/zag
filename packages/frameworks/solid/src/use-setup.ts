import type { StateMachine as S } from "@zag-js/core"
import { createSignal, onMount } from "solid-js"

export type UseSetupProps = {
  send: (evt: S.Event<S.AnyEventObject>) => void
  id: string
}

export function useSetup<T extends HTMLElement = HTMLDivElement>(props: UseSetupProps) {
  const { send, id } = props
  const [node, setNode] = createSignal<T>()

  onMount(() => {
    Promise.resolve().then(() => {
      const el = node()

      const doc = el?.ownerDocument
      const root = el?.getRootNode()

      send({ type: "SETUP", doc, root, id })
    })
  })

  return setNode
}
