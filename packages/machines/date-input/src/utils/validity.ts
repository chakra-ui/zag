import type { Params } from "@zag-js/core"
import { constrainValue } from "@zag-js/date-utils"
import type { DateInputSchema, DateValue, SegmentType } from "../date-input.types"

/**
 * If all segments are valid, return the actual value date, otherwise return the placeholder date.
 */
export function getDisplayValue(ctx: Params<DateInputSchema>) {
  const { context, prop } = ctx
  const index = context.get("activeIndex")
  const validSegments = context.get("validSegments")
  const allSegments = prop("allSegments")
  const value = context.get("value")[index]
  const placeholderValue = context.get("placeholderValue")
  const activeValidSegments = validSegments[index] ?? {}

  return value && Object.keys(activeValidSegments).length >= Object.keys(allSegments).length ? value : placeholderValue
}

export function markSegmentInvalid(ctx: Params<DateInputSchema>, segmentType: SegmentType) {
  const { context } = ctx
  const validSegments = context.get("validSegments")
  const index = context.get("activeIndex")
  const activeValidSegments = validSegments[index]

  if (activeValidSegments?.[segmentType]) {
    const next = [...validSegments]
    next[index] = { ...activeValidSegments }
    delete next[index][segmentType]
    context.set("validSegments", next)
  }
}

export function markSegmentValid(ctx: Params<DateInputSchema>, segmentType: SegmentType) {
  const { context, prop } = ctx
  const validSegments = context.get("validSegments")
  const allSegments = prop("allSegments")
  const index = context.get("activeIndex")
  const activeValidSegments = validSegments[index]

  if (!activeValidSegments?.[segmentType]) {
    const next = [...validSegments]
    next[index] = { ...activeValidSegments, [segmentType]: true }
    if (segmentType === "year" && allSegments.era) {
      next[index].era = true
    }
    context.set("validSegments", next)
  }
}

export function isAllSegmentsCompleted(ctx: Params<DateInputSchema>) {
  const { context, prop } = ctx
  const validSegments = context.get("validSegments")
  const allSegments = prop("allSegments")
  const index = context.get("activeIndex")
  const activeValidSegments = validSegments[index] ?? {}
  const validKeys = Object.keys(activeValidSegments)
  const allKeys = Object.keys(allSegments)

  return (
    validKeys.length >= allKeys.length ||
    (validKeys.length === allKeys.length - 1 && allSegments.dayPeriod && !activeValidSegments.dayPeriod)
  )
}

export function setValue(ctx: Params<DateInputSchema>, value: DateValue) {
  const { context, prop } = ctx
  if (prop("disabled") || prop("readOnly")) return
  const validSegments = context.get("validSegments")
  const allSegments = prop("allSegments")
  const index = context.get("activeIndex")
  const activeValidSegments = validSegments[index] ?? {}
  const validKeys = Object.keys(activeValidSegments)
  const date = constrainValue(value, prop("min"), prop("max"))

  if (isAllSegmentsCompleted(ctx)) {
    if (validKeys.length === 0) {
      validSegments[index] = { ...allSegments }
      context.set("validSegments", validSegments)
    }

    const values = Array.from(context.get("value"))
    values[index] = date
    context.set("value", values)
  } else {
    context.set("placeholderValue", date)
  }
}

/**
 * When all segments of a group become invalid, remove that group's date from value.
 * This prevents syncValidSegments from falsely re-validating the group when another
 * group's value changes (since syncValidSegments marks all segments valid for any non-null date).
 */
export function clearValueIfAllSegmentsInvalid(ctx: Params<DateInputSchema>) {
  const { context } = ctx
  const index = context.get("activeIndex")
  const activeValidSegments = context.get("validSegments")[index] ?? {}
  if (Object.keys(activeValidSegments).length === 0) {
    const values = context.get("value")
    if (index < values.length) {
      context.set("value", values.slice(0, index))
    }
  }
}

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
