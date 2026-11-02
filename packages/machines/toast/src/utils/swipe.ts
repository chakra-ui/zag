import type { Point } from "@zag-js/types"
import type { Placement, SwipeDirection } from "../toast.types"

/** Distance (px) a release must pass, in an allowed direction, to dismiss */
export const SWIPE_THRESHOLD = 40
/** Pulling back this far (px) from the furthest point cancels the dismiss */
const REVERSE_CANCEL_THRESHOLD = 10
/** Exponent that damps movement in directions that can't dismiss */
const DAMPING_EXPONENT = 0.5
/** Movement (px) before a press counts as a drag */
const MIN_DRAG_DISTANCE = 1

export function getDisplacement(direction: SwipeDirection, delta: Point) {
  switch (direction) {
    case "up":
      return -delta.y
    case "down":
      return delta.y
    case "left":
      return -delta.x
    case "right":
      return delta.x
  }
}

/** Swipe toward the nearest edges: the placement's side, plus the aligned edge */
export function getDefaultSwipeDirections(placement: Placement, dir: "ltr" | "rtl" = "ltr"): SwipeDirection[] {
  const [side, align] = placement.split("-")
  const directions: SwipeDirection[] = [side === "top" ? "up" : "down"]
  if (align) {
    const towardEnd = align === "end"
    directions.push(towardEnd !== (dir === "rtl") ? "right" : "left")
  }
  return directions
}

const damp = (value: number) => Math.sign(value) * Math.abs(value) ** DAMPING_EXPONENT

export interface SwipeMoveResult {
  offset: Point
  direction: SwipeDirection | null
}

export interface SwipeTracker {
  move: (point: Point) => SwipeMoveResult
  end: () => SwipeDirection | null
}

export function createSwipeTracker(directions: SwipeDirection[], start: Point): SwipeTracker {
  const allows = (direction: SwipeDirection) => directions.includes(direction)
  const horizontal = allows("left") || allows("right")
  const vertical = allows("up") || allows("down")
  // With both directions on one axis, pulling back may mean swiping the other way
  const bidirectional = (direction: SwipeDirection) =>
    direction === "left" || direction === "right" ? allows("left") && allows("right") : allows("up") && allows("down")

  let origin = start
  let firstMove = true
  let dragging = false
  let lockedAxis: "x" | "y" | null = null
  let intended: SwipeDirection | null = null
  let delta: Point = { x: 0, y: 0 }
  const furthest: Partial<Record<SwipeDirection, number>> = {}

  function getCandidate(): SwipeDirection {
    const axis = lockedAxis ?? (Math.abs(delta.x) >= Math.abs(delta.y) ? "x" : "y")
    if (axis === "x") return delta.x > 0 ? "right" : "left"
    return delta.y > 0 ? "down" : "up"
  }

  return {
    move(point) {
      // iOS delays the first pointermove, so start from where the drag actually begins
      if (firstMove) {
        origin = point
        firstMove = false
      }

      delta = { x: point.x - origin.x, y: point.y - origin.y }

      if (!dragging && Math.hypot(delta.x, delta.y) >= MIN_DRAG_DISTANCE) {
        dragging = true
        if (horizontal && vertical) lockedAxis = Math.abs(delta.x) > Math.abs(delta.y) ? "x" : "y"
      }

      if (dragging && !intended) {
        const candidate = getCandidate()
        if (allows(candidate)) intended = candidate
      }

      for (const direction of directions) {
        furthest[direction] = Math.max(furthest[direction] ?? 0, getDisplacement(direction, delta))
      }

      const x = horizontal && lockedAxis !== "y" ? delta.x : 0
      const y = vertical && lockedAxis !== "x" ? delta.y : 0

      const dampX = (x > 0 && !allows("right")) || (x < 0 && !allows("left"))
      const dampY = (y > 0 && !allows("down")) || (y < 0 && !allows("up"))

      return {
        offset: { x: dampX ? damp(x) : x, y: dampY ? damp(y) : y },
        direction: intended,
      }
    },

    end() {
      if (!dragging) return null
      for (const direction of directions) {
        if (lockedAxis === "x" && (direction === "up" || direction === "down")) continue
        if (lockedAxis === "y" && (direction === "left" || direction === "right")) continue

        const displacement = getDisplacement(direction, delta)
        if (displacement <= SWIPE_THRESHOLD) continue

        const pulledBack = (furthest[direction] ?? 0) - displacement >= REVERSE_CANCEL_THRESHOLD
        if (pulledBack && !bidirectional(direction)) continue

        return direction
      }
      return null
    },
  }
}
