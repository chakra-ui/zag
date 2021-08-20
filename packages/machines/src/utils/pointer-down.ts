import { ref } from "valtio"

type TrackPointerDownOptions = {
  doc?: Document
  pointerdownNode?: HTMLElement | null
}

export function trackPointerDown(ctx: TrackPointerDownOptions) {
  const doc = ctx.doc ?? document
  const fn = (event: PointerEvent) => {
    if (event.target instanceof HTMLElement) {
      ctx.pointerdownNode = ref(event.target)
    }
  }
  doc.addEventListener("pointerdown", fn)
  return () => {
    doc.removeEventListener("pointerdown", fn)
  }
}
