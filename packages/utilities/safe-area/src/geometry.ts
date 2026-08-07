/** A point as `[x, y]`. */
export type Point = [x: number, y: number]

/** A rect as `[x, y, width, height]`. */
export type Rect = [x: number, y: number, width: number, height: number]

/** A polygon, as a list of points in hull order. */
export type Polygon = Point[]

/** Hidden or unmeasured elements report `0,0,0,0`, which would anchor the hull at the viewport origin. */
export function isMeasuredRect(rect: Rect | null | undefined): rect is Rect {
  if (!rect) return false
  for (let i = 0; i < 4; i++) {
    if (!Number.isFinite(rect[i])) return false
  }
  return rect[2] > 0 && rect[3] > 0
}

/** The four corners of a rect, grown by `padding` on every side. */
export function getRectCorners(rect: Rect, padding = 0): Polygon {
  const minX = rect[0] - padding
  const minY = rect[1] - padding
  const maxX = rect[0] + rect[2] + padding
  const maxY = rect[1] + rect[3] + padding
  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ]
}

export function isPointInRect(rect: Rect, point: Point, padding = 0): boolean {
  return (
    point[0] >= rect[0] - padding &&
    point[0] <= rect[0] + rect[2] + padding &&
    point[1] >= rect[1] - padding &&
    point[1] <= rect[1] + rect[3] + padding
  )
}

/** Andrew's monotone chain. Returns `[]` rather than a degenerate shape that silently tests as empty. */
export function getConvexHull(points: Polygon): Polygon {
  if (points.length < 3) return []

  const sorted = points.slice().sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]))

  const lower: Polygon = []
  for (let i = 0; i < sorted.length; i++) {
    const point = sorted[i]
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop()
    }
    lower.push(point)
  }

  const upper: Polygon = []
  for (let i = sorted.length - 1; i >= 0; i--) {
    const point = sorted[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop()
    }
    upper.push(point)
  }

  lower.pop()
  upper.pop()

  const hull = lower.concat(upper)
  return hull.length < 3 ? [] : hull
}

function cross(o: Point, a: Point, b: Point): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
}

/** Ray casting. Points exactly on an edge fall either way. */
export function isPointInPolygon(polygon: Polygon, point: Point): boolean {
  if (polygon.length < 3) return false
  const x = point[0]
  const y = point[1]
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]
    const yi = polygon[i][1]
    const xj = polygon[j][0]
    const yj = polygon[j][1]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

export interface SafeAreaPolygonOptions {
  /** Where the pointer left the element it was on. */
  exitPoint: Point
  contentRect: Rect | null | undefined
  /**
   * Absorbs sub-pixel jitter and the gap between elements.
   * @default 8
   */
  padding?: number | undefined
}

/**
 * The corridor the pointer may travel through without the overlay closing.
 *
 * A wedge from the exit point rather than a hull of both rects: hulling the whole trigger flares
 * sideways when the content is wider, swallowing siblings beside it.
 */
export function getSafeAreaPolygon(options: SafeAreaPolygonOptions): Polygon {
  const { exitPoint, contentRect, padding = 8 } = options

  if (!isMeasuredRect(contentRect)) return []

  const base = getRectCorners([exitPoint[0], exitPoint[1], 0, 0], padding)
  return getConvexHull(base.concat(getRectCorners(contentRect, padding)))
}
