import { trackPointerDown as onPointerDown } from "@core-dom/event"
import { ref } from "valtio"
import { Dict } from "./types"

type TrackPointerDownOptions = {
  doc?: Document
  pointerdownNode?: HTMLElement | null
}

export function trackPointerDown(ctx: TrackPointerDownOptions) {
  const doc = ctx.doc ?? document
  return onPointerDown(doc, (el) => {
    ctx.pointerdownNode = ref(el)
  })
}

export interface PropNormalizer {
  <T extends Dict = Dict>(props: T): Dict
}

export const defaultPropNormalizer: PropNormalizer = (props: Dict) => props
