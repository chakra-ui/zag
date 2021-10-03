import { addPointerEvent, EventListenerWithPointInfo as Listener } from "tiny-dom-event"
import { distance } from "tiny-point/distance"
import { pipe } from "tiny-fn"
import { isMouseEvent, isLeftClick } from "tiny-guard"

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
