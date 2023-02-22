import type { CalendarDate, DateDuration, DateValue } from "@internationalized/date"
import { alignCenter, alignEnd, alignStart } from "./constrain"
import type { DateAlignment } from "./types"

export function alignDate(
  date: CalendarDate,
  alignment: DateAlignment,
  duration: DateDuration,
  locale: string,
  min?: DateValue | undefined,
  max?: DateValue | undefined,
) {
  switch (alignment) {
    case "start":
      return alignStart(date, duration, locale, min, max)
    case "end":
      return alignEnd(date, duration, locale, min, max)
    case "center":
    default:
      return alignCenter(date, duration, locale, min, max)
  }
}

export function alignStartDate(
  date: CalendarDate,
  startDate: CalendarDate,
  endDate: CalendarDate,
  duration: DateDuration,
  locale: string,
  min?: DateValue | undefined,
  max?: DateValue | undefined,
) {
  if (date.compare(startDate) < 0) {
    return alignEnd(date, duration, locale, min, max)
  }
  if (date.compare(endDate) > 0) {
    return alignStart(date, duration, locale, min, max)
  }
  return startDate
}
