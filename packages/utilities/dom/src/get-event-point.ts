import { isTouchEvent } from "./event"

type PointType = "page" | "client"

const fallback = {
  pageX: 0,
  pageY: 0,
  clientX: 0,
  clientY: 0,
}

export function getEventPoint(event: MouseEvent | TouchEvent | PointerEvent, type: PointType = "page") {
  const point = isTouchEvent(event) ? event.touches[0] ?? event.changedTouches[0] ?? fallback : event
  return { x: point[`${type}X`], y: point[`${type}Y`] }
}
