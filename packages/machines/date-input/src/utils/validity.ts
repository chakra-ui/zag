import type { Params } from "@zag-js/core"
import type { DateInputSchema, SelectionMode } from "../date-input.types"
import type { IncompleteDate } from "./incomplete-date"

export function getGroupCount(selectionMode: SelectionMode): number {
  return selectionMode === "range" ? 2 : 1
}

// ---------------------------------------------------------------------------
// Active segment helpers
// ---------------------------------------------------------------------------

/**
 * Returns the cumulative segment count for all groups before `index`.
 * Used to convert between global (DOM) and local (per-group) segment indices.
 */
export function getGroupOffset(allSegments: unknown[][], index: number) {
  return allSegments.slice(0, index).reduce<number>((acc, segs) => acc + (segs as unknown[]).length, 0)
}

/**
 * Resolves the active segment context: all segment groups, the current group,
 * the global-to-local offset, and the local index within the group.
 */
export function resolveActiveSegment(ctx: Params<DateInputSchema>) {
  const { context, computed } = ctx
  const index = context.get("activeIndex")
  const activeSegmentIndex = context.get("activeSegmentIndex")
  const allSegments = computed("segments")
  const offset = getGroupOffset(allSegments, index)
  return { allSegments, segments: allSegments[index], offset, localIndex: activeSegmentIndex - offset }
}

export function getActiveSegment(ctx: Params<DateInputSchema>) {
  const { allSegments, localIndex } = resolveActiveSegment(ctx)
  const index = ctx.context.get("activeIndex")
  return allSegments[index]?.[localIndex]
}

export function advanceToNextSegment(ctx: Params<DateInputSchema>) {
  const { context } = ctx
  const index = context.get("activeIndex")
  const { allSegments, segments, offset, localIndex } = resolveActiveSegment(ctx)
  const nextLocalIndex = segments.findIndex((s, i) => i > localIndex && s.isEditable)

  if (nextLocalIndex !== -1) {
    context.set("activeSegmentIndex", offset + nextLocalIndex)
    return
  }

  // Advance to the first editable segment of the next date group (e.g. range mode)
  const nextGroupSegments = allSegments[index + 1]
  if (!nextGroupSegments) return

  const firstNextGroupEditableLocalIndex = nextGroupSegments.findIndex((s) => s.isEditable)
  if (firstNextGroupEditableLocalIndex === -1) return

  context.set("activeIndex", index + 1)
  context.set("activeSegmentIndex", offset + segments.length + firstNextGroupEditableLocalIndex)
}

// ---------------------------------------------------------------------------
// displayValues helpers
// ---------------------------------------------------------------------------

/** Returns the IncompleteDate for the currently active group. */
export function getActiveDisplayValue(ctx: Params<DateInputSchema>): IncompleteDate {
  const index = ctx.context.get("activeIndex")
  return ctx.context.get("displayValues")[index]
}

/** Replaces the IncompleteDate for the given group index and persists it. */
export function setDisplayValue(ctx: Params<DateInputSchema>, index: number, dv: IncompleteDate) {
  const displayValues = [...ctx.context.get("displayValues")]
  displayValues[index] = dv
  ctx.context.set("displayValues", displayValues)
}
