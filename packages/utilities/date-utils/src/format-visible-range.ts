import { type DateValue, endOfMonth, isSameDay, startOfMonth } from "@internationalized/date"
import { getDayFormatter } from "./get-day-formatter"
import { getMonthFormatter } from "./get-month-formatter"

export function formatVisibleRange(startDate: DateValue, endDate: DateValue | null, locale: string, timeZone: string) {
  const start = startDate
  const end = endDate ?? startDate

  const dayFormatter = getDayFormatter(locale, timeZone)

  if (!isSameDay(start, startOfMonth(start))) {
    return dayFormatter.formatRange(start.toDate(timeZone), end.toDate(timeZone))
  }

  const monthFormatter = getMonthFormatter(locale, timeZone)

  if (isSameDay(end, endOfMonth(start))) {
    return monthFormatter.format(start.toDate(timeZone))
  }

  if (isSameDay(end, endOfMonth(end))) {
    return monthFormatter.formatRange(start.toDate(timeZone), end.toDate(timeZone))
  }

  return ""
}
