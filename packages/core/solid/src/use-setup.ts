import { AnyFunction } from "@core-foundation/utils/fn"
import { onMount } from "solid-js"

export type UseSetupProps = {
  send: AnyFunction
  id: string
}

export function useSetup<T extends HTMLElement = HTMLElement>(props: UseSetupProps) {
  const { send, id } = props
  let ref: T

  onMount(() => {
    send({ type: "SETUP", doc: ref.ownerDocument, id })
  })

  //@ts-ignore
  return ref as T
}
