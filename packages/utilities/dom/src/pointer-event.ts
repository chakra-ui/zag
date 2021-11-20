import { pipe, isLeftClick, isMouseEvent } from "@ui-machines/utils"
import { addPointerEvent, AnyPointerEvent, EventListenerWithPointInfo as Listener, PointerEventInfo } from "./listener"

export function trackPointerDown(doc: Document, onPointerDown: (el: HTMLElement) => void) {
  const win = doc.defaultView ?? window
  const fn = (event: PointerEvent) => {
    if (event.target instanceof win.HTMLElement) {
      onPointerDown(event.target)
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
    const { point: p } = info
    const distance = Math.sqrt(p.x ** 2 + p.y ** 2)
    if (distance < threshold) return

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
