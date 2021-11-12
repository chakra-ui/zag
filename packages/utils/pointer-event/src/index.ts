import { pipe } from "tiny-fn"
import { isLeftClick, isMouseEvent } from "tiny-guard"
import { distance } from "tiny-point/distance"
import { ref } from "valtio"
import {
  addPointerEvent,
  AnyPointerEvent,
  EventListenerWithPointInfo as Listener,
  PointerEventInfo,
} from "../utils/dom-event"

type TrackPointerDownOptions = {
  doc?: Document
  pointerdownNode?: HTMLElement | null
}

export function trackPointerDown(ctx: TrackPointerDownOptions) {
  const doc = ctx.doc ?? document
  const win = doc.defaultView ?? window
  const fn = (event: PointerEvent) => {
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
  ctx: { doc?: Document; threshold?: number }
  onPointerUp: VoidFunction
  onPointerMove: (info: PointerEventInfo, event: AnyPointerEvent) => void
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

    onPointerMove(info, event)
  }

  return pipe(
    addPointerEvent(doc, "pointermove", handlePointerMove, false),
    addPointerEvent(doc, "pointerup", onPointerUp, false),
    addPointerEvent(doc, "pointercancel", onPointerUp, false),
    addPointerEvent(doc, "contextmenu", onPointerUp, false),
  )
}
