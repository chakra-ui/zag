import type { CalendarDate } from "@internationalized/date"
import { getStartOfWeek } from "./get-start-of-week"

export function getEndOfWeek(date: CalendarDate, locale: string, firstDayOfWeek: number = 0) {
  return getStartOfWeek(date, locale, firstDayOfWeek).add({ days: 6 })
}
