import { clampValue } from "@zag-js/utils"
import type { Point } from "@zag-js/types"
import type { SwipeDirection } from "../drawer.types"

/** Swipe-area → swiping-open pointer intent (px). */
const SWIPE_AREA_OPEN_INTENT_MIN_PX = 5

/** Swipe axis is vertical (up/down) vs horizontal (left/right). */
export function isVerticalSwipeDirection(direction: SwipeDirection): boolean {
  return direction === "down" || direction === "up"
}

/** Dismiss direction uses negative offset along the swipe axis (up / left). */
export function isNegativeSwipeDirection(direction: SwipeDirection): boolean {
  return direction === "up" || direction === "left"
}

export const oppositeSwipeDirection: Record<SwipeDirection, SwipeDirection> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
}

/** Content size along the active swipe axis from a border box. */
export function getSwipeDirectionSize(rect: DOMRect, direction: SwipeDirection): number {
  return isVerticalSwipeDirection(direction) ? rect.height : rect.width
}

/** Normalized swipe progress (0–1) for stack UI from content size and offsets. */
export function resolveSwipeProgress(
  contentSize: number | null,
  dragOffset: number | null,
  snapPointOffset: number,
): number {
  if (!contentSize || contentSize <= 0) return 0
  const currentOffset = dragOffset ?? snapPointOffset
  return clampValue(1 - currentOffset / contentSize, 0, 1)
}

/**
 * True when pointer moved far enough in the swipe-open direction from `start` to `current`
 * (used for swipe-area → swiping-open transition).
 */
export function hasOpeningSwipeIntent(start: Point, current: Point, direction: SwipeDirection): boolean {
  const isVertical = isVerticalSwipeDirection(direction)
  const sign = isNegativeSwipeDirection(direction) ? -1 : 1
  const axis = isVertical ? "y" : "x"
  const displacement = (start[axis] - current[axis]) * sign
  return displacement > SWIPE_AREA_OPEN_INTENT_MIN_PX
}
