import type { Point } from "@zag-js/rect-utils"

interface Vector extends Point {
  type: "vector"
}

interface CubicCurve {
  p1: Point
  p2: Point
  p: Point
}

export type MPathParam = ["M", Point]
export type LPathParam = ["L", Point]
export type ZPathParam = ["Z"]
export type CPathParam = ["C", Point, Point, Point]
export type QPathParam = ["Q", Point, Point]
export type PathParam = MPathParam | LPathParam | ZPathParam | CPathParam | QPathParam

export type SvgPath = [MPathParam, ...PathParam[]]
export type SvgPathPortion = PathParam[]

/**
 * Removes midpoints from a set of points.
 *
 * @param points
 * @returns Points with midpoints removed
 */
export function simplifyPoints(points: Point[]): Point[] {
  const pointHashes = new Set<string>()

  const result: Point[] = []

  points.forEach((point, i) => {
    const prevPoint = points[i - 1]
    const nextPoint = points[i + 1]

    if (prevPoint?.x === point.x && point.x === nextPoint?.x) {
      return
    }
    if (prevPoint?.y === point.y && point.y === nextPoint?.y) {
      return
    }

    const hash = `${point.x}|${point.y}`

    if (pointHashes.has(hash)) {
      return
    }

    result.push(point)
  })

  return result
}

/**
 * Adds midpoints to the center of line segments represented by an array of points.
 *
 * @param points Points without midpoints
 * @returns Points with midpoints
 */
export function withMidpoints(points: Point[]): Point[] {
  const pointsWithMid: Point[] = []

  points.forEach((pt, i) => {
    const [ptA, ptB, ptC] = [pt, points[i + 1], points[i + 2]]

    if (!ptC || !ptB) {
      pointsWithMid.push(ptA)
      return
    }

    const midpt = {
      x: ptA.x + (ptB.x - ptA.x) / 2,
      y: ptA.y + (ptB.y - ptA.y) / 2,
      color: "green",
      label: "midpoint",
    }

    pointsWithMid.push(ptA, midpt)
  })

  return pointsWithMid
}

export function pathToD(path: SvgPath): string {
  return path
    .map(([cmd, ...points]) => [cmd, ...points.map((point: Point) => `${point.x},${point.y}`)].join(" "))
    .join(" ")
}

const lineToVector = (p1: Point, p2: Point): Vector => {
  const vector = {
    type: "vector" as const,
    x: p2.x - p1.x,
    y: p2.y - p1.y,
  }

  return vector
}

const vectorToUnitVector = (v: Vector): Vector => {
  let magnitude = v.x * v.x + v.y * v.y
  magnitude = Math.sqrt(magnitude)
  const unitVector = {
    type: "vector" as const,
    x: v.x / magnitude,
    y: v.y / magnitude,
  }
  return unitVector
}

export const roundOneCorner = (p1: Point, corner: Point, p2: Point, radius: number = 20): CubicCurve => {
  const corner_to_p1 = lineToVector(corner, p1)
  const corner_to_p2 = lineToVector(corner, p2)
  const p1dist = Math.hypot(corner_to_p1.x, corner_to_p1.y)
  const p2dist = Math.hypot(corner_to_p2.x, corner_to_p2.y)
  if (p1dist * p2dist === 0) {
    return {
      p1: corner,
      p2: corner,
      p: corner,
    }
  }
  const resolvedRadius = Math.min(radius, p1dist - 0.1, p2dist - 0.1)
  const corner_to_p1_unit = vectorToUnitVector(corner_to_p1)
  const corner_to_p2_unit = vectorToUnitVector(corner_to_p2)

  const curve_p1 = {
    x: corner.x + corner_to_p1_unit.x * resolvedRadius,
    y: corner.y + corner_to_p1_unit.y * resolvedRadius,
  }
  const curve_p2 = {
    x: corner.x + corner_to_p2_unit.x * resolvedRadius,
    y: corner.y + corner_to_p2_unit.y * resolvedRadius,
  }
  const path = {
    p1: curve_p1,
    p2: curve_p2,
    p: corner,
  }

  return path
}

export function isBendable(p1: Point, corner: Point, p2: Point): boolean {
  return !((p1.x === corner.x && p2.x === corner.x) || (p1.y === corner.y && p2.y === corner.y))
}

/**
 * Rounds the corners of an SVG path.
 *
 * @param path The SVG path to round
 * @returns A rounded SVG path
 */
export function roundPath(path: SvgPath): SvgPath {
  const contiguousLinePaths: SvgPathPortion[] = []
  const bentPath: SvgPathPortion = []
  const current: SvgPathPortion = []

  for (const svgPoint of path) {
    const [cmd] = svgPoint
    if (cmd !== "L") {
      if (current.length > 1) {
        contiguousLinePaths.push([...current])
        current.length = 0
      }
    }
    if (cmd === "M") {
      current.push(svgPoint)
    } else if (cmd === "L") {
      current.push(svgPoint)
    }
  }
  if (current.length > 1) {
    contiguousLinePaths.push([...current])
  }

  for (const linePath of contiguousLinePaths) {
    const points = linePath.map(([, point]) => point as Point)
    const pointsWithMid = withMidpoints(simplifyPoints(points))
    const bentPathPortion: SvgPath = [linePath[0] as MPathParam]

    pointsWithMid.forEach((pt, i, pts) => {
      if (i >= 2 && i <= pts.length - 2 && isBendable(pts[i - 1], pt, pts[i + 1])) {
        const { p1, p2, p } = roundOneCorner(pts[i - 1], pt, pts[i + 1], /* radius = */ 10)

        bentPathPortion.push(["L", p1], ["C", p1, p, p2])
      } else {
        bentPathPortion.push(["L", pt])
      }
    })

    bentPath.push(...bentPathPortion)
  }

  return bentPath as SvgPath
}
