import type { DateDuration } from "@internationalized/date"
import { alignCenter, alignEnd, alignStart } from "./constrain"
import type { DateAlignment, DateValue } from "./types"

export function alignDate<T extends DateValue>(
  date: T,
  alignment: DateAlignment,
  duration: DateDuration,
  locale: string,
  min?: DateValue | undefined,
  max?: DateValue | undefined,
): T {
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

export function alignStartDate<T extends DateValue>(
  date: T,
  startDate: T,
  endDate: DateValue,
  duration: DateDuration,
  locale: string,
  min?: DateValue | undefined,
  max?: DateValue | undefined,
): T {
  if (date.compare(startDate) < 0) {
    return alignEnd(date, duration, locale, min, max)
  }
  if (date.compare(endDate) > 0) {
    return alignStart(date, duration, locale, min, max)
  }
  return startDate
}
