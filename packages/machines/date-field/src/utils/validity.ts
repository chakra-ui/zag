import type { Params } from "@zag-js/core"
import { constrainValue } from "@zag-js/date-utils"
import type { DateFieldSchema, DateValue, SegmentType } from "../date-field.types"

/**
 * If all segments are valid, return the actual value date, otherwise return the placeholder date.
 */
export function getDisplayValue(ctx: Params<DateFieldSchema>) {
  const { context, prop } = ctx
  const index = context.get("activeIndex")
  const validSegments = context.get("validSegments")
  const allSegments = prop("allSegments")
  const value = context.get("value")[index]
  const placeholderValue = context.get("placeholderValue")
  const activeValidSegments = validSegments[index]

  return value && Object.keys(activeValidSegments).length >= Object.keys(allSegments).length ? value : placeholderValue
}

export function markSegmentInvalid(ctx: Params<DateFieldSchema>, segmentType: SegmentType) {
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

export function markSegmentValid(ctx: Params<DateFieldSchema>, segmentType: SegmentType) {
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

export function isAllSegmentsCompleted(ctx: Params<DateFieldSchema>) {
  const { context, prop } = ctx
  const validSegments = context.get("validSegments")
  const allSegments = prop("allSegments")
  const index = context.get("activeIndex")
  const activeValidSegments = validSegments[index]
  const validKeys = Object.keys(activeValidSegments)
  const allKeys = Object.keys(allSegments)

  return (
    validKeys.length >= allKeys.length ||
    (validKeys.length === allKeys.length - 1 && allSegments.dayPeriod && !activeValidSegments.dayPeriod)
  )
}

export function setValue(ctx: Params<DateFieldSchema>, value: DateValue) {
  const { context, prop } = ctx
  if (prop("disabled") || prop("readOnly")) return
  const validSegments = context.get("validSegments")
  const allSegments = prop("allSegments")
  const index = context.get("activeIndex")
  const activeValidSegments = validSegments[index]
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

export function getActiveSegment(ctx: Params<DateFieldSchema>) {
  const { context, computed } = ctx
  const index = context.get("activeIndex")
  const activeSegmentIndex = context.get("activeSegmentIndex")
  return computed("segments")[index]?.[activeSegmentIndex]
}

export function advanceToNextSegment(ctx: Params<DateFieldSchema>) {
  const { context, computed } = ctx
  const index = context.get("activeIndex")
  const activeSegmentIndex = context.get("activeSegmentIndex")
  const segments = computed("segments")[index]
  const nextActiveSegmentIndex = segments.findIndex((s, i) => i > activeSegmentIndex && s.isEditable)
  if (nextActiveSegmentIndex !== -1) {
    context.set("activeSegmentIndex", nextActiveSegmentIndex)
  }
}
