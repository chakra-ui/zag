import { isPointInPolygon, type Point } from "@zag-js/rect-utils"

export interface GraceAreaOptions {
  padding?: number
}

export function createGraceArea(
  exitPoint: Point,
  triggerRect: DOMRect,
  targetRect: DOMRect,
  options: GraceAreaOptions = {},
): Point[] {
  const { padding = 5 } = options

  // Determine the exit side based on the exit point relative to the trigger
  const exitSide = getExitSide(exitPoint, triggerRect)

  // Create padded exit points
  const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide, padding)

  // Get target rect corners
  const targetPoints = getRectCorners(targetRect)

  // Create convex hull from padded exit points and target points
  return getConvexHull([...paddedExitPoints, ...targetPoints])
}

export function isPointerInGraceArea(point: Point, graceArea: Point[]): boolean {
  return isPointInPolygon(graceArea, point)
}

function getExitSide(point: Point, rect: DOMRect): "top" | "right" | "bottom" | "left" {
  const { x, y } = point
  const { top, right, bottom, left } = rect

  const distanceToTop = Math.abs(top - y)
  const distanceToRight = Math.abs(right - x)
  const distanceToBottom = Math.abs(bottom - y)
  const distanceToLeft = Math.abs(left - x)

  const minDistance = Math.min(distanceToTop, distanceToRight, distanceToBottom, distanceToLeft)

  if (minDistance === distanceToLeft) return "left"
  if (minDistance === distanceToRight) return "right"
  if (minDistance === distanceToTop) return "top"
  return "bottom"
}

function getPaddedExitPoints(exitPoint: Point, exitSide: string, padding: number): Point[] {
  const { x, y } = exitPoint

  switch (exitSide) {
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
    default:
      return []
  }
}

function getRectCorners(rect: DOMRect): Point[] {
  const { top, right, bottom, left } = rect
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ]
}

// Simplified convex hull algorithm (Andrew's algorithm)
function getConvexHull(points: Point[]): Point[] {
  if (points.length <= 1) return points.slice()

  // Sort points lexicographically
  const sortedPoints = points.slice().sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x
    return a.y - b.y
  })

  // Build lower hull
  const lower: Point[] = []
  for (const point of sortedPoints) {
    while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop()
    }
    lower.push(point)
  }

  // Build upper hull
  const upper: Point[] = []
  for (let i = sortedPoints.length - 1; i >= 0; i--) {
    const point = sortedPoints[i]
    while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop()
    }
    upper.push(point)
  }

  // Remove last point of each half because it's repeated at the beginning of the other half
  lower.pop()
  upper.pop()

  return lower.concat(upper)
}

function crossProduct(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}
