import { clampValue } from "@zag-js/utils"
import type { ResolvedSnapPoint, SnapPoint } from "../drawer.types"

export interface ResolveSnapPointOptions {
  contentSize: number
  viewportSize: number
  rootFontSize: number
}

function resolveSnapPointValue(snapPoint: SnapPoint, viewportSize: number, rootFontSize: number): number | null {
  if (!Number.isFinite(viewportSize) || viewportSize <= 0) return null

  if (typeof snapPoint === "number") {
    if (!Number.isFinite(snapPoint)) return null
    if (snapPoint <= 1) return clampValue(snapPoint, 0, 1) * viewportSize
    return snapPoint
  }

  const trimmed = snapPoint.trim()

  if (trimmed.endsWith("px")) {
    const value = Number.parseFloat(trimmed)
    return Number.isFinite(value) ? value : null
  }

  if (trimmed.endsWith("rem")) {
    const value = Number.parseFloat(trimmed)
    return Number.isFinite(value) ? value * rootFontSize : null
  }

  return null
}

export function resolveSnapPoint(snapPoint: SnapPoint, options: ResolveSnapPointOptions): ResolvedSnapPoint | null {
  const { contentSize, viewportSize, rootFontSize } = options
  const maxSize = Math.min(contentSize, viewportSize)
  if (!Number.isFinite(maxSize) || maxSize <= 0) return null

  const resolvedSize = resolveSnapPointValue(snapPoint, viewportSize, rootFontSize)
  if (resolvedSize === null || !Number.isFinite(resolvedSize)) return null

  const height = clampValue(resolvedSize, 0, maxSize)
  return {
    value: snapPoint,
    height,
    offset: Math.max(0, contentSize - height),
  }
}

const HEIGHT_DEDUP_EPSILON_PX = 1

/**
 * Collapse snap points that resolve to the same height (within 1px), keeping the first occurrence in list order.
 */
export function dedupeSnapPoints(points: ResolvedSnapPoint[]): ResolvedSnapPoint[] {
  if (points.length <= 1) return points

  const deduped: ResolvedSnapPoint[] = []
  const seenHeights: number[] = []

  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index]
    const isDuplicate = seenHeights.some((height) => Math.abs(height - point.height) <= HEIGHT_DEDUP_EPSILON_PX)
    if (isDuplicate) continue

    seenHeights.push(point.height)
    deduped.push(point)
  }

  deduped.reverse()
  return deduped
}

export function findClosestSnapPoint(offset: number, snapPoints: ResolvedSnapPoint[]): ResolvedSnapPoint {
  return snapPoints.reduce((acc, curr) => {
    const closestDiff = Math.abs(offset - acc.offset)
    const currentDiff = Math.abs(offset - curr.offset)
    return currentDiff < closestDiff ? curr : acc
  })
}
