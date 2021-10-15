import { addPointerEvent, EventListenerWithPointInfo as Listener } from "tiny-dom-event"
import { cast, pipe } from "tiny-fn"
import { isLeftClick, isMouseEvent } from "tiny-guard"
import { distance } from "tiny-point/distance"
import { ref } from "valtio"
import { DOM } from "./types"

type TrackPointerDownOptions = {
  doc?: Document
  pointerdownNode?: HTMLElement | null
}

export function trackPointerDown(ctx: TrackPointerDownOptions) {
  const doc = ctx.doc ?? document
  const fn = (event: PointerEvent) => {
    const win = cast<DOM.This>(event.view ?? window)
    if (event.target instanceof win.HTMLElement) {
      ctx.pointerdownNode = ref(event.target)
    }
  }
  doc.addEventListener("pointerdown", fn)
  return () => {
    doc.removeEventListener("pointerdown", fn)
  }
}

type TrackPointerMoveOptions = {
  ctx: {
    doc?: Document
    threshold?: number
  }
  onPointerUp: VoidFunction
  onPointerMove: Listener
}

export function trackPointerMove(opts: TrackPointerMoveOptions) {
  const { onPointerMove, onPointerUp, ctx } = opts
  const { doc = document, threshold = 5 } = ctx

  const handlePointerMove: Listener = (event, info) => {
    if (distance(info.point) < threshold) return

    // Because Safari doesn't trigger mouseup events when it's above a `<select>`
    if (isMouseEvent(event) && isLeftClick(event)) {
      onPointerUp()
      return
    }

    onPointerMove(event, info)
  }

  return pipe(
    addPointerEvent(doc, "pointermove", handlePointerMove, false),
    addPointerEvent(doc, "pointerup", onPointerUp, false),
    addPointerEvent(doc, "pointercancel", onPointerUp, false),
    addPointerEvent(doc, "contextmenu", onPointerUp, false),
  )
}
