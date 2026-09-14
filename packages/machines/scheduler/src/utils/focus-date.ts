import type { CalendarDateTime } from "@internationalized/date"
import { getEndOfWeek, getStartOfWeek } from "@zag-js/date-utils"

/** Null for keys that don't move focus. */
export function getFocusDateForKey(params: {
  key: string
  date: CalendarDateTime
  locale: string
  startOfWeek?: number | undefined
}): CalendarDateTime | null {
  const { key, date, locale, startOfWeek } = params
  switch (key) {
    case "ArrowLeft":
      return date.subtract({ days: 1 })
    case "ArrowRight":
      return date.add({ days: 1 })
    case "ArrowUp":
      return date.subtract({ weeks: 1 })
    case "ArrowDown":
      return date.add({ weeks: 1 })
    case "Home":
      return getStartOfWeek(date, locale, startOfWeek)
    case "End":
      return getEndOfWeek(date, locale, startOfWeek)
    default:
      return null
  }
}
