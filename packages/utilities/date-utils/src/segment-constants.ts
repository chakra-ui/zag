import { DateSegmentPart } from "./types"

const EDITABLE_SEGMENTS = {
  year: true,
  month: true,
  day: true,
  hour: true,
  minute: true,
  second: true,
  dayPeriod: true,
  era: true,
}

export type DateSegments = Partial<typeof EDITABLE_SEGMENTS>

export const SEGMENT_PAGE_STEP = {
  year: 5,
  month: 2,
  day: 7,
  hour: 2,
  minute: 15,
  second: 15,
}

export function isSegmentEditable(segment: DateSegmentPart) {
  return EDITABLE_SEGMENTS[segment]
}
