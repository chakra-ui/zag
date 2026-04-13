import { containsPoint, distanceFromPoint } from "@zag-js/rect-utils"
import type { Point, Rect } from "@zag-js/rect-utils"
import type { CollisionOptions, CollisionResult, DropEntry, DropPlacement } from "../dnd.types"

/* -----------------------------------------------------------------------------
 * closestEdge — for sortable lists and tree views
 *
 * Computes distance from pointer to the top/bottom (or left/right) edges of
 * each target rect. Picks the target with the smallest edge distance.
 * Determines position based on which zone the pointer is in:
 *   - Within edgeThreshold of start edge → "before"
 *   - Within edgeThreshold of end edge → "after"
 *   - Middle zone → "on" (if allowed), else midpoint split
 * -----------------------------------------------------------------------------*/

export function closestEdge(pointer: Point, entries: DropEntry[], options: CollisionOptions): CollisionResult | null {
  if (entries.length === 0) return null

  const { edgeThreshold, allowDropOn, orientation } = options
  const isVertical = orientation === "vertical"

  let bestEntry: DropEntry | null = null
  let bestDistance = Infinity

  for (const entry of entries) {
    const dist = distanceFromPoint(entry.rect, pointer)
    if (dist.value < bestDistance) {
      bestDistance = dist.value
      bestEntry = entry
    }
  }

  if (!bestEntry) return null

  const placement = getEdgePosition(pointer, bestEntry.rect, {
    edgeThreshold,
    allowDropOn,
    isVertical,
  })

  return { value: bestEntry.value, placement }
}

/* -----------------------------------------------------------------------------
 * closestCenter — for grids and simple reordering
 *
 * Picks the entry whose center is closest to the pointer.
 * Position is determined by which side of the center the pointer is on.
 * -----------------------------------------------------------------------------*/

export function closestCenter(pointer: Point, entries: DropEntry[], options: CollisionOptions): CollisionResult | null {
  if (entries.length === 0) return null

  const { orientation } = options
  const isVertical = orientation === "vertical"

  let bestEntry: DropEntry | null = null
  let bestDistance = Infinity

  for (const entry of entries) {
    const center = entry.rect.center
    const dx = pointer.x - center.x
    const dy = pointer.y - center.y
    const distSq = dx * dx + dy * dy
    if (distSq < bestDistance) {
      bestDistance = distSq
      bestEntry = entry
    }
  }

  if (!bestEntry) return null

  const center = bestEntry.rect.center
  const placement: DropPlacement = isVertical
    ? pointer.y < center.y
      ? "before"
      : "after"
    : pointer.x < center.x
      ? "before"
      : "after"

  return { value: bestEntry.value, placement }
}

/* -----------------------------------------------------------------------------
 * pointerWithin — for kanban columns and container-based drops
 *
 * Returns the entry whose rect contains the pointer. If multiple entries
 * contain the pointer (nested/overlapping), picks the smallest (most specific).
 * Returns null when the pointer is outside all entries.
 * -----------------------------------------------------------------------------*/

export function pointerWithin(pointer: Point, entries: DropEntry[], options: CollisionOptions): CollisionResult | null {
  if (entries.length === 0) return null

  const { edgeThreshold, allowDropOn, orientation } = options
  const isVertical = orientation === "vertical"

  let bestEntry: DropEntry | null = null
  let bestArea = Infinity

  for (const entry of entries) {
    if (!containsPoint(entry.rect, pointer)) continue
    const area = entry.rect.width * entry.rect.height
    if (area < bestArea) {
      bestArea = area
      bestEntry = entry
    }
  }

  if (!bestEntry) return null

  const placement = getEdgePosition(pointer, bestEntry.rect, {
    edgeThreshold,
    allowDropOn,
    isVertical,
  })

  return { value: bestEntry.value, placement }
}

/* -----------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------*/

interface EdgePositionOptions {
  edgeThreshold: number
  allowDropOn: boolean
  isVertical: boolean
}

function getEdgePosition(pointer: Point, rect: Rect, opts: EdgePositionOptions): DropPlacement {
  const { edgeThreshold, allowDropOn, isVertical } = opts

  const start = isVertical ? rect.minY : rect.minX
  const end = isVertical ? rect.maxY : rect.maxX
  const pos = isVertical ? pointer.y : pointer.x
  const size = end - start

  if (!allowDropOn) {
    // Simple midpoint split
    const mid = start + size / 2
    return pos < mid ? "before" : "after"
  }

  // Three-zone split: edge threshold zones for before/after, middle for "on"
  const distFromStart = pos - start
  const distFromEnd = end - pos

  if (distFromStart <= edgeThreshold) return "before"
  if (distFromEnd <= edgeThreshold) return "after"

  return "on"
}
