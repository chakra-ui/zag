import type { Point } from "../geometry/types"
import { isBottomHandle, isLeftHandle, isRightHandle, isTopHandle, type HandlePosition } from "./handle"

const ARROW_DIRECTIONS: Record<string, readonly [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

const DIRECTION_KEYS = { left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown" } as const

/**
 * Converts an arrow key and a step into a delta. Other keys give no movement.
 */
export function getArrowKeyDelta(key: string, step: number): Point {
  const [x, y] = ARROW_DIRECTIONS[key] ?? [0, 0]
  return { x: x * step, y: y * step }
}

/**
 * Converts a direction and a step into a delta.
 */
export function getDirectionDelta(direction: keyof typeof DIRECTION_KEYS, step: number): Point {
  return getArrowKeyDelta(DIRECTION_KEYS[direction], step)
}

/**
 * The delta for resizing with an arrow key on a handle. Only the axes the handle moves change,
 * so a right arrow on the east edge grows the box and on the west edge shrinks it.
 */
export function getKeyboardResizeDelta(key: string, handle: HandlePosition, step: number): Point {
  const { x, y } = getArrowKeyDelta(key, step)
  const horizontal = isLeftHandle(handle) || isRightHandle(handle)
  const vertical = isTopHandle(handle) || isBottomHandle(handle)
  return { x: horizontal ? x : 0, y: vertical ? y : 0 }
}
