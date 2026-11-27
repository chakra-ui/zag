import type { Point } from "../types"
import type { SwipeAxis, SwipeDirection } from "./types"

export const axisOf = (direction: SwipeDirection): SwipeAxis =>
  direction === "left" || direction === "right" ? "x" : "y"

export const crossAxisOf = (axis: SwipeAxis): SwipeAxis => (axis === "x" ? "y" : "x")

export function directionOf(axis: SwipeAxis, value: number): SwipeDirection {
  if (axis === "x") return value > 0 ? "right" : "left"
  return value > 0 ? "down" : "up"
}

const opposites: Record<SwipeDirection, SwipeDirection> = { up: "down", down: "up", left: "right", right: "left" }

/** The direction facing the other way */
export function oppositeDirection(direction: SwipeDirection): SwipeDirection {
  return opposites[direction]
}

/** Turns `start` and `end` into `left` or `right` for the text direction */
export function resolveSwipeDirection(
  direction: SwipeDirection | "start" | "end",
  dir: "ltr" | "rtl" = "ltr",
): SwipeDirection {
  if (direction === "start") return dir === "rtl" ? "right" : "left"
  if (direction === "end") return dir === "rtl" ? "left" : "right"
  return direction
}

/** How far `offset` went toward `direction`: positive when it went that way */
export function getSwipeDisplacement(direction: SwipeDirection, offset: Point) {
  switch (direction) {
    case "up":
      return -offset.y
    case "down":
      return offset.y
    case "left":
      return -offset.x
    case "right":
      return offset.x
  }
}
