import type { PlacementSide } from "@zag-js/popper"
import { getElementPolygon, type Point, type RectInit } from "@zag-js/rect-utils"

const oppositeSideMap: Record<PlacementSide, PlacementSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
}

export function getOppositeSide(side: PlacementSide): PlacementSide {
  return oppositeSideMap[side]
}

/**
 * Returns a polygon that covers the area between the exit point and the target
 * element, so the pointer can safely travel across the gap between the trigger
 * and the content (e.g. when `positioning.gutter` is set) without closing the
 * hover card.
 *
 * @param exitPoint - the point where the pointer left the element
 * @param side - the side of the exit point on which the target element sits
 * @param targetRect - the rect of the element the pointer may be moving towards
 * @param padding - forgiveness (in px) applied around the exit point
 */
export function createGraceArea(
  exitPoint: Point,
  side: PlacementSide,
  targetRect: RectInit,
  padding = 5,
): Point[] | null {
  const polygon = getElementPolygon(targetRect, side)
  if (!polygon) return null
  const [first, second] = getPaddedExitPoints(exitPoint, side, padding)
  return [first, ...polygon, second]
}

function getPaddedExitPoints(exitPoint: Point, side: PlacementSide, padding: number): [Point, Point] {
  const { x, y } = exitPoint
  switch (side) {
    case "top":
      return [
        { x: x - padding, y: y + padding },
        { x: x + padding, y: y + padding },
      ]
    case "bottom":
      return [
        { x: x - padding, y: y - padding },
        { x: x + padding, y: y - padding },
      ]
    case "left":
      return [
        { x: x + padding, y: y - padding },
        { x: x + padding, y: y + padding },
      ]
    case "right":
      return [
        { x: x - padding, y: y - padding },
        { x: x - padding, y: y + padding },
      ]
  }
}
