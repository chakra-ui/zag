import { CalendarDate, isSameDay } from "@internationalized/date"
import { formatRange } from "./format-range"
import { getDayFormatter } from "./get-day-formatter"

export function formatSelectedDate(
  startDate: CalendarDate,
  endDate: CalendarDate | null,
  locale: string,
  timeZone: string,
) {
  let start = startDate
  let end = endDate ?? startDate

  let formatter = getDayFormatter(start, locale, timeZone)

  if (isSameDay(start, end)) {
    return formatter.format(start.toDate(timeZone))
  }

  return formatRange(start, end, formatter, (start, end) => `${start} – ${end}`, timeZone)
}
