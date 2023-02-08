import type { CalendarDate, DateFormatter, DateValue } from "@internationalized/date"

export type DateGranularity = "day" | "hour" | "minute" | "second" | "year" | "month"
export type DateAlignment = "start" | "end" | "center"

export type GetFormatterFn = (options: Intl.DateTimeFormatOptions) => DateFormatter
export type DateAvailableFn = (date: DateValue) => boolean
export type GetPlaceholderFn = (options: { field: string; locale: string }) => string
export type DateAdjustFn = (options: { startDate: CalendarDate; focusedDate: CalendarDate }) => {
  startDate: CalendarDate
  focusedDate: CalendarDate
  endDate: CalendarDate
}

export type DateSegmentPart = Intl.DateTimeFormatPartTypes
export type DateFormatOptions = Intl.ResolvedDateTimeFormatOptions
