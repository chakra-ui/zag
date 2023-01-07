import { DateFormatter, DateValue } from "@internationalized/date"
import { DateSegments, isSegmentEditable } from "./segment-constants"
import { getSegmentLimits } from "./segment-limit"

export function getAllSegments(segments: Intl.DateTimeFormatPart[]) {
  return segments
    .filter((segment) => isSegmentEditable(segment.type))
    .reduce((acc, segment) => ((acc[segment.type] = true), acc), {})
}

function getPlaceholder(params: { field: string }) {
  const placeholder = { day: "dd", month: "mm", year: "yyyy" }
  return placeholder[params.field]
}

export function getSegments(date: DateValue, validSegments: DateSegments, formatter: DateFormatter, timeZone: string) {
  const segments = formatter.formatToParts(date.toDate(timeZone))
  return segments.map((segment) => {
    let isEditable = isSegmentEditable(segment.type)
    if (segment.type === "era") isEditable = false

    let isPlaceholder = isSegmentEditable(segment.type) && !validSegments[segment.type]
    let placeholder = isSegmentEditable(segment.type) ? getPlaceholder({ field: segment.type }) : null

    return {
      type: segment.type,
      text: isPlaceholder ? placeholder : segment.value,
      ...getSegmentLimits(date, segment.type, formatter.resolvedOptions()),
      isPlaceholder: !!isPlaceholder,
      placeholder,
      isEditable: !!isEditable,
    }
  })
}
