import { disableTextSelection } from "@zag-js/text-selection"
import { addDomEvent } from "./add-dom-event"
import { getEventPoint } from "./get-event-point"

interface Point {
  x: number
  y: number
}

interface TimestampedPoint extends Point {
  /**
   * The time when the point was recorded.
   */
  timestamp: number
}

export interface PointerMoveDetails {
  /**
   * The current position of the pointer.
   */
  point: Point
  /**
   * The event that triggered the move.
   */
  event: PointerEvent
  /**
   * The velocity of the pointer on the x and y axis.
   */
  velocity: Point
}

export interface PointerMoveHandlers {
  /**
   * Called when the pointer is released.
   */
  onPointerUp: VoidFunction
  /**
   * Called when the pointer moves.
   */
  onPointerMove: (details: PointerMoveDetails) => void
}

export function trackPointerMove(doc: Document, handlers: PointerMoveHandlers) {
  const { onPointerMove, onPointerUp } = handlers

  const history: TimestampedPoint[] = []

  const handleMove = (event: PointerEvent) => {
    const point = getEventPoint(event)
    history.push({ ...point, timestamp: performance.now() })

    const distance = Math.sqrt(point.x ** 2 + point.y ** 2)
    const moveBuffer = event.pointerType === "touch" ? 10 : 5

    if (distance < moveBuffer) return

    // Because Safari doesn't trigger mouseup events when it's above a `<select>`
    if (event.pointerType === "mouse" && event.button === 0) {
      onPointerUp()
      return
    }

    onPointerMove({ point, event, velocity: getVelocity(history, 0.1) })
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
    history.length = 0
  }
}

function lastDevicePoint(history: TimestampedPoint[]): TimestampedPoint {
  return history[history.length - 1]
}

function ms(seconds: number): number {
  return seconds * 1000
}

function sec(milliseconds: number): number {
  return milliseconds / 1000
}

function getVelocity(history: TimestampedPoint[], timeDelta: number): Point {
  if (history.length < 2) return { x: 0, y: 0 }

  let i = history.length - 1
  let timestampedPoint: TimestampedPoint | null = null
  const lastPoint = lastDevicePoint(history)

  while (i >= 0) {
    timestampedPoint = history[i]
    if (lastPoint.timestamp - timestampedPoint.timestamp > ms(timeDelta)) {
      break
    }
    i--
  }

  if (!timestampedPoint) return { x: 0, y: 0 }

  const time = sec(lastPoint.timestamp - timestampedPoint.timestamp)
  if (time === 0) return { x: 0, y: 0 }

  const currentVelocity = {
    x: (lastPoint.x - timestampedPoint.x) / time,
    y: (lastPoint.y - timestampedPoint.y) / time,
  }

  if (currentVelocity.x === Infinity) currentVelocity.x = 0
  if (currentVelocity.y === Infinity) currentVelocity.y = 0

  return {
    x: Math.abs(currentVelocity.x),
    y: Math.abs(currentVelocity.y),
  }
}
