type PointType = "page" | "client"

function pointFromTouch(e: TouchEvent, type: PointType = "client") {
  const point = e.touches[0] || e.changedTouches[0]
  return { x: point[`${type}X`], y: point[`${type}Y`] }
}

function pointFromMouse(point: MouseEvent | PointerEvent, type: PointType = "client") {
  return { x: point[`${type}X`], y: point[`${type}Y`] }
}

type AnyPointerEvent = MouseEvent | TouchEvent | PointerEvent

const isTouchEvent = (event: AnyPointerEvent): event is TouchEvent => "touches" in event && event.touches.length > 0

export function getEventPoint(event: any, type: PointType = "client") {
  return isTouchEvent(event) ? pointFromTouch(event, type) : pointFromMouse(event, type)
}
