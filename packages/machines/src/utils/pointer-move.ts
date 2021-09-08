import { addPointerEvent, EventListenerWithPointInfo as Listener } from "@core-dom/event"
import { is, pipe } from "@core-foundation/utils"

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
    if (info.point.distance() < threshold) {
      return
    }

    // Because Safari doesn't trigger mouseup events when it's above a `<select>`
    if (is.mouseEvent(event) && event.button === 0) {
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
