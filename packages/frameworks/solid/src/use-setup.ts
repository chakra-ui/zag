import type { StateMachine as S } from "@zag-js/core"
import { createSignal, onMount } from "solid-js"

export type UseSetupProps = {
  send: (evt: S.Event<S.AnyEventObject>) => void
  id: string
}

export function useSetup<T extends HTMLElement = HTMLDivElement>(props: UseSetupProps) {
  const { send, id } = props
  const [el, setEl] = createSignal<T>()

  onMount(() => {
    Promise.resolve().then(() => {
      send({ type: "SETUP", doc: el()?.getRootNode(), id })
    })
  })

  return setEl
}
