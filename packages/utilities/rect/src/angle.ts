import type { Point, Rect } from "./types"

export function getPointAngle(rect: Rect, point: Point, reference = rect.center) {
  const x = point.x - reference.x
  const y = point.y - reference.y
  const deg = Math.atan2(x, y) * (180 / Math.PI) + 180
  return 360 - deg
}
