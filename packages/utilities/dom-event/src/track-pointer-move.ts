import { disableTextSelection } from "@zag-js/text-selection"
import { addDomEvent } from "./add-dom-event"
import { getEventPoint } from "./get-event-point"

type Point = {
  x: number
  y: number
}

type PointerMoveHandlers = {
  onPointerUp: VoidFunction
  onPointerMove: (details: { point: Point; event: PointerEvent }) => void
}

export function trackPointerMove(doc: Document, handlers: PointerMoveHandlers) {
  const { onPointerMove, onPointerUp } = handlers

  const handleMove = (event: PointerEvent) => {
    const point = getEventPoint(event)

    const distance = Math.sqrt(point.x ** 2 + point.y ** 2)
    const moveBuffer = event.pointerType === "touch" ? 10 : 5

    if (distance < moveBuffer) return

    // Because Safari doesn't trigger mouseup events when it's above a `<select>`
    if (event.pointerType === "mouse" && event.button === 0) {
      onPointerUp()
      return
    }

    onPointerMove({ point, event })
  }

  const cleanups = [
    addDomEvent(doc, "pointermove", handleMove, false),
    addDomEvent(doc, "pointerup", onPointerUp, false),
    addDomEvent(doc, "pointercancel", onPointerUp, false),
    addDomEvent(doc, "contextmenu", onPointerUp, false),
    disableTextSelection({ doc }),
  ]

  return () => {
    cleanups.forEach((cleanup) => cleanup())
  }
}
