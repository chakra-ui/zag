import { rect } from "."
import type { Rect, RectSide } from "./types"

const { min, max } = Math

/**
 * Checks if a Rect intersects another Rect
 */
export function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.maxX && a.y < b.maxY && a.maxX > b.x && a.maxY > b.y
}

/**
 * Returns a new Rect that represents the intersection between two Rects
 */
export function intersection(a: Rect, b: Rect): Rect {
  const x = max(a.x, b.x)
  const y = max(a.y, b.y)
  const x2 = min(a.x + a.width, b.x + b.width)
  const y2 = min(a.y + a.height, b.y + b.height)
  return rect(x, y, x2 - x, y2 - y)
}

/**
 * Returns whether two rects collide along each edge
 */
export function collisions(a: Rect, b: Rect): Record<RectSide, boolean> {
  return {
    top: a.minY <= b.minY,
    right: a.maxX >= b.maxX,
    bottom: a.maxY >= b.maxY,
    left: a.minX <= b.minX,
  }
}
