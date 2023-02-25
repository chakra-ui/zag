import { CalendarDate, isSameDay } from "@internationalized/date"
import { formatRange } from "./format-range"
import { getDateFormatter } from "./get-formatter"
import type { GetFormatterFn } from "./types"

export function formatSelectedDate(
  startDate: CalendarDate,
  endDate: CalendarDate | null,
  getFormatter: GetFormatterFn,
  isSelectingRange: boolean,
  timeZone: string,
) {
  let start = startDate
  let end = endDate ?? startDate

  let formatter = getDateFormatter(start, end, getFormatter, timeZone)

  if (isSelectingRange || start == null || end == null) {
    return ""
  }

  if (isSameDay(start, end)) {
    return formatter.format(start.toDate(timeZone))
  }

  return formatRange(start, end, formatter, (start, end) => `${start} – ${end}`, timeZone)
}
