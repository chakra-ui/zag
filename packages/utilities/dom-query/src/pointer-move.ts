import { addDomEvent, getEventPoint } from "./event"
import { disableTextSelection } from "./text-selection"
import type { Point } from "./types"

export interface PointerMoveDetails {
  /**
   * The current position of the pointer.
   */
  point: Point
  /**
   * The event that triggered the move.
   */
  event: PointerEvent
}

export interface PointerUpDetails {
  /**
   * The current position of the pointer.
   */
  point: Point
}

export interface PointerMoveHandlers {
  /**
   * Called when the pointer is released.
   */
  onPointerUp: (details: PointerUpDetails) => void
  /**
   * Called when the pointer moves.
   */
  onPointerMove: (details: PointerMoveDetails) => void
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
      handleUp(event)
      return
    }

    onPointerMove({ point, event })
  }

  const handleUp = (event: PointerEvent | MouseEvent) => {
    const point = getEventPoint(event)
    onPointerUp({ point })
  }

  const cleanups = [
    addDomEvent(doc, "pointermove", handleMove, false),
    addDomEvent(doc, "pointerup", handleUp, false),
    addDomEvent(doc, "pointercancel", handleUp, false),
    addDomEvent(doc, "contextmenu", handleUp, false),
    disableTextSelection({ doc }),
  ]

  return () => {
    cleanups.forEach((cleanup) => cleanup())
  }
}
