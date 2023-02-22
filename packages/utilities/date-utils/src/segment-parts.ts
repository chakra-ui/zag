import type { DateFormatter, DateValue } from "@internationalized/date"
import { getTodayPlaceholderDate } from "./placeholder"
import { DateSegments, isSegmentEditable } from "./segment-constants"
import { getSegmentLimits } from "./segment-limit"

export function getAllSegments(segments: Intl.DateTimeFormatPart[]) {
  return segments
    .filter((segment) => isSegmentEditable(segment.type))
    .reduce((acc, segment) => ((acc[segment.type] = true), acc), {})
}

function getPlaceholder(options: { field: string }) {
  const placeholder = { day: "dd", month: "mm", year: "yyyy" }
  return placeholder[options.field]
}

export function getSegments(
  date: DateValue | undefined,
  validSegments: DateSegments,
  formatter: DateFormatter,
  timeZone: string,
) {
  const dateValue = date || getTodayPlaceholderDate(timeZone)
  const segments = formatter.formatToParts(dateValue.toDate(timeZone))

  return segments.map((segment) => {
    let isEditable = isSegmentEditable(segment.type)
    if (segment.type === "era") isEditable = false

    let isPlaceholder = isSegmentEditable(segment.type) && !validSegments[segment.type]
    let placeholder = isSegmentEditable(segment.type) ? getPlaceholder({ field: segment.type }) : null

    return {
      type: segment.type,
      text: isPlaceholder ? placeholder : segment.value,
      ...getSegmentLimits(dateValue, segment.type, formatter.resolvedOptions()),
      isPlaceholder: !!isPlaceholder,
      placeholder,
      isEditable: !!isEditable,
    }
  })
}

export type DateSegmentDetails = {
  type: keyof Intl.DateTimeFormatPartTypesRegistry
  text: string
  value?: number
  min?: number
  max?: number
  isPlaceholder: boolean
  placeholder: string
  isEditable: boolean
}
