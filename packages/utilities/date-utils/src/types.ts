import type { CalendarDate, DateDuration, DateFormatter, DateValue } from "@internationalized/date"
import { DateSegments } from "./segment-constants"

export type DateGranularity = "day" | "hour" | "minute" | "second" | "year" | "month"

export type DateAlignment = "start" | "end" | "center"

export type DateContext = DateValueRange & {
  locale: string
  timeZone: string
  duration: DateDuration
  isUnavailable?: (date: DateValue) => boolean
}

export type DateValueRange = {
  min?: DateValue
  max?: DateValue
}

export type DateSegmentContext = {
  timeZone: string
  locale: string
  granularity: DateGranularity
  allSegments: DateSegments
  displayValue: DateValue
  validSegments: DateSegments
  getDateFormatter: (options: Intl.DateTimeFormatOptions) => DateFormatter
  getPlaceholder: (options: { field: string; locale: string }) => string
}

export type DateDescriptionContext = {
  start?: CalendarDate
  end?: CalendarDate
  isSelectingRange?: boolean
  timeZone: string
  locale: string
  getDateFormatter: (options: Intl.DateTimeFormatOptions) => DateFormatter
  toString: (start: string, end: string) => string
}

export type DateSegmentPart = Intl.DateTimeFormatPartTypes

export type DateFormatOptions = Intl.ResolvedDateTimeFormatOptions
