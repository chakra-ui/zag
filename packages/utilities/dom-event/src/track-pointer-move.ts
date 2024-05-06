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

export interface PointerUpDetails {
  /**
   * The position of the pointer before it was released.
   */
  point: Point
  /**
   * The velocity of the pointer on the x and y axis.
   */
  velocity: Point
}

export interface ValidMoveDetails {
  event: PointerEvent
  point: Point
}

export interface TrackPointerMoveOptions {
  /**
   * The starting point of the pointer.
   */
  startPoint?: TimestampedPoint | null
  /**
   * Called when the pointer is released.
   */
  onPointerUp: (details: PointerUpDetails) => void
  /**
   * Called when the pointer moves.
   */
  onPointerMove: (details: PointerMoveDetails) => void
  /**
   * A function that determines if the move is valid.
   */
  isValidMove?: (details: ValidMoveDetails) => boolean
}

const defaultIsValidMove = (details: ValidMoveDetails) => {
  const { event, point } = details
  const distance = Math.sqrt(point.x ** 2 + point.y ** 2)
  const moveBuffer = event.pointerType === "touch" ? 10 : 5
  if (distance < moveBuffer) return false
  return true
}

export function trackPointerMove(doc: Document, handlers: TrackPointerMoveOptions) {
  const { onPointerMove, onPointerUp, isValidMove = defaultIsValidMove, startPoint: anchorPoint } = handlers

  const history: TimestampedPoint[] = []

  if (anchorPoint) {
    history.push(anchorPoint)
  }

  const handlePointerUp = (event: PointerEvent | MouseEvent) => {
    const lastPoint = { x: event.clientX, y: event.clientY }
    const lastVelocity = getVelocity(history, 0.1)
    onPointerUp({ point: lastPoint, velocity: lastVelocity })
  }

  const handleMove = (event: PointerEvent) => {
    const point = getEventPoint(event)
    history.push({ ...point, timestamp: event.timeStamp })

    if (!isValidMove?.({ event, point })) return

    // Because Safari doesn't trigger mouseup events when it's above a `<select>`
    if (event.pointerType === "mouse" && event.button === 0) {
      handlePointerUp(event)
      return
    }

    onPointerMove({ point, event, velocity: getVelocity(history, 0.1) })
  }

  const cleanups = [
    addDomEvent(doc, "pointermove", handleMove, false),
    addDomEvent(doc, "pointerup", handlePointerUp, false),
    addDomEvent(doc, "pointercancel", handlePointerUp, false),
    addDomEvent(doc, "contextmenu", handlePointerUp, false),
    disableTextSelection({ doc }),
  ]

  return () => {
    cleanups.forEach((cleanup) => cleanup())
  }
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
  let point: TimestampedPoint | null = null
  const lastPoint = history[history.length - 1]

  while (i >= 0) {
    point = history[i]
    if (lastPoint.timestamp - point.timestamp > ms(timeDelta)) {
      break
    }
    i--
  }

  if (!point) return { x: 0, y: 0 }

  const time = sec(lastPoint.timestamp - point.timestamp)
  if (time === 0) return { x: 0, y: 0 }

  const currentVelocity = {
    x: (lastPoint.x - point.x) / time,
    y: (lastPoint.y - point.y) / time,
  }

  if (currentVelocity.x === Infinity) currentVelocity.x = 0
  if (currentVelocity.y === Infinity) currentVelocity.y = 0

  return {
    x: Math.abs(currentVelocity.x),
    y: Math.abs(currentVelocity.y),
  }
}
