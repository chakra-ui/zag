import type { DateDuration, DateValue } from "@internationalized/date"
import { alignCenter, alignEnd, alignStart } from "./constrain"
import type { DateAlignment } from "./types"

export function alignDate(
  date: DateValue,
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
  date: DateValue,
  startDate: DateValue,
  endDate: DateValue,
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
