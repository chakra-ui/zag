import type { CalendarDate, DateDuration, DateFormatter, DateValue } from "@internationalized/date"

type Stringify = ({ start, end }: { start: string; end: string }) => string

export type Granularity = "day" | "hour" | "minute" | "second" | "year" | "month"

export type DateContext = DateValueRange & {
  locale: string
  timeZone: string
  duration: DateDuration
  isDateUnavailable?: (date: CalendarDate) => boolean
}

export type DateValueRange = {
  min?: DateValue
  max?: DateValue
}

export type DateSegmentContext = {
  timeZone: string
  locale: string
  granularity: Granularity
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
  stringify: Stringify
}
