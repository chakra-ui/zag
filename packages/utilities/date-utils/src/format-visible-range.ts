import { CalendarDate, endOfMonth, isSameDay, startOfMonth } from "@internationalized/date"
import { formatRange } from "./format-range"
import { getMonthFormatter } from "./get-month-formatter"
import { getDayFormatter } from "./get-day-formatter"

export function formatVisibleRange(
  startDate: CalendarDate | null,
  endDate: CalendarDate | null,
  locale: string,
  timeZone: string,
  isAria: boolean,
) {
  if (!startDate) return ""

  let start = startDate
  let end = endDate ?? startDate

  let monthFormatter = getMonthFormatter(locale, timeZone)
  let dateFormatter = getDayFormatter(locale, timeZone)

  if (!isSameDay(start, startOfMonth(start))) {
    return isAria
      ? formatRange(start, end, dateFormatter, (start, end) => `${start} – ${end}`, timeZone)
      : dateFormatter.formatRange(start.toDate(timeZone), end.toDate(timeZone))
  }

  if (isSameDay(end, endOfMonth(start))) {
    return monthFormatter.format(start.toDate(timeZone))
  }

  if (isSameDay(end, endOfMonth(end))) {
    return isAria
      ? formatRange(start, end, monthFormatter, (start, end) => `${start} – ${end}`, timeZone)
      : monthFormatter.formatRange(start.toDate(timeZone), end.toDate(timeZone))
  }
}
