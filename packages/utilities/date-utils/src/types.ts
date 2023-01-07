import type { DateFormatter, DateValue } from "@internationalized/date"
import type { DateSegments } from "./segment-constants"

export type DateGranularity = "day" | "hour" | "minute" | "second" | "year" | "month"
export type DateAlignment = "start" | "end" | "center"

export type GetFormatterFn = (options: Intl.DateTimeFormatOptions) => DateFormatter
export type DateAvailableFn = (date: DateValue) => boolean
export type GetPlaceholderFn = (options: { field: string; locale: string }) => string

export type DateSegmentPart = Intl.DateTimeFormatPartTypes
export type DateFormatOptions = Intl.ResolvedDateTimeFormatOptions

export type { DateSegments }
