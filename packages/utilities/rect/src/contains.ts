import { Rect } from "./rect"
import type { Point } from "./types"

export function containsPoint(r: Rect, p: Point): boolean {
  return r.minX <= p.x && p.x <= r.maxX && r.minY <= p.y && p.y <= r.maxY
}

export function containsRect(a: Rect, b: Rect): boolean {
  return Object.values(b.corners).every((c) => containsPoint(a, c))
}

export function contains(r: Rect, v: Rect | Point): boolean {
  return v instanceof Rect ? containsRect(r, v) : containsPoint(r, v)
}
