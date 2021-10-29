import type { StateMachine as S } from "@ui-machines/core"
import { createSignal, onMount } from "solid-js"

export type UseSetupProps = {
  send: (evt: S.Event<S.AnyEventObject>) => void
  id: string
}

export function useSetup<T extends HTMLElement = HTMLElement>(props: UseSetupProps) {
  const { send, id } = props
  const [el, setEl] = createSignal<T>()

  onMount(() => {
    send({ type: "SETUP", doc: el()?.ownerDocument, id })
  })

  return setEl
}
