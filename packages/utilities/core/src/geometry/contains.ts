import { getRectCorners, isRect } from "./rect"
import type { Point, Rect } from "./types"

export function containsPoint(r: Rect, p: Point): boolean {
  return r.minX <= p.x && p.x <= r.maxX && r.minY <= p.y && p.y <= r.maxY
}

export function containsRect(a: Rect, b: Rect): boolean {
  return Object.values(getRectCorners(b)).every((c) => containsPoint(a, c))
}

export function contains(r: Rect, v: Rect | Point): boolean {
  return isRect(v) ? containsRect(r, v) : containsPoint(r, v)
}
