import { CalendarDate, endOfMonth, isSameDay, startOfMonth } from "@internationalized/date"
import { formatRange } from "./format-range"
import { getDateFormatter, getMonthFormatter } from "./get-formatter"
import type { GetFormatterFn } from "./types"

export function formatVisibleRange(
  startDate: CalendarDate | null,
  endDate: CalendarDate | null,
  getFormatter: GetFormatterFn,
  isAria: boolean,
  timeZone: string,
) {
  if (!startDate) return ""

  let start = startDate
  let end = endDate ?? startDate

  let monthFormatter = getMonthFormatter(start, end, getFormatter, timeZone)
  let dateFormatter = getDateFormatter(start, end, getFormatter, timeZone)

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
