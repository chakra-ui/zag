import {
  cast,
  contains,
  DOMEvent,
  MaybeArray,
  toArray,
} from "@ui-machines/utils"
import { ref } from "valtio"
import { Dict } from "./types"

export function trackPointerDown(ctx: {
  doc?: Document
  pointerdownNode?: HTMLElement | null
}) {
  const doc = ctx.doc ?? document
  const listener = (event: any) => {
    if (event.target instanceof HTMLElement) {
      ctx.pointerdownNode = ref(event.target)
    }
  }
  return DOMEvent.on(doc, "pointerdown", listener)
}

type DetermineBlurOptions = {
  exclude: MaybeArray<HTMLElement | null>
  pointerdownNode?: HTMLElement | null
}

export function determineBlur(
  event: Pick<FocusEvent, "relatedTarget">,
  options: DetermineBlurOptions,
) {
  const exclude = toArray(options.exclude)
  const relatedTarget = cast<HTMLElement>(
    event.relatedTarget ?? options.pointerdownNode,
  )
  return exclude.every((el) => !contains(el, relatedTarget))
}

export interface PropNormalizer {
  <T extends Dict = Dict>(props: T): Dict
}

export const defaultPropNormalizer: PropNormalizer = (props: Dict) => props

export function dispatchInputEvent(input: HTMLElement, value: string | number) {
  if (!(input instanceof HTMLInputElement)) return

  input.type = "text"
  input.hidden = true

  const set = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set

  set?.call(input, value)

  const evt = new Event("input", { bubbles: true })
  input.dispatchEvent(evt)

  input.type = "hidden"
  input.hidden = false
}
