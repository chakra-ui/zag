import { AnyFunction } from "@core-foundation/utils/fn"
import { createSignal, onMount } from "solid-js"

export type UseSetupProps = {
  send: AnyFunction
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
