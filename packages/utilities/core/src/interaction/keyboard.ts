import type { Point } from "../geometry/types"
import { hasEdge, type HandlePlacement } from "./handle"

const ARROW_DIRECTIONS: Record<string, readonly [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

/**
 * Converts an arrow key and a step into a delta. Other keys give no movement.
 */
export function arrowDelta(key: string, step: number): Point {
  const [x, y] = ARROW_DIRECTIONS[key] ?? [0, 0]
  return { x: x * step, y: y * step }
}

/**
 * The delta for resizing with an arrow key on a handle. Only the axes the handle moves change,
 * so a right arrow on the east edge grows the box and on the west edge shrinks it.
 */
export function resizeKeyDelta(key: string, handle: HandlePlacement, step: number): Point {
  const { x, y } = arrowDelta(key, step)
  const horizontal = hasEdge(handle, "w") || hasEdge(handle, "e")
  const vertical = hasEdge(handle, "n") || hasEdge(handle, "s")
  return { x: horizontal ? x : 0, y: vertical ? y : 0 }
}
