import type { DateFormatter, DateValue } from "@internationalized/date"

export type DateGranularity = "day" | "hour" | "minute" | "second" | "year" | "month"
export type DateAlignment = "start" | "end" | "center"

export type GetFormatterFn = (options: Intl.DateTimeFormatOptions) => DateFormatter
export type DateAvailableFn = (date: DateValue, locale: string) => boolean
export type GetPlaceholderFn = (options: { field: string; locale: string }) => string
export type DateAdjustFn = (options: { startDate: DateValue; focusedDate: DateValue }) => {
  startDate: DateValue
  focusedDate: DateValue
  endDate: DateValue
}
export type DateFormatOptions = Intl.ResolvedDateTimeFormatOptions
