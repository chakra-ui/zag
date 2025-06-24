import type { DateFormatter, DateValue } from "@internationalized/date"
import { endOfMonth, isSameDay, startOfMonth } from "@internationalized/date"
import { getDayFormatter, getMonthFormatter } from "./formatter"

export function formatRange(
  startDate: DateValue,
  endDate: DateValue,
  formatter: DateFormatter,
  toString: (start: string, end: string) => string,
  timeZone: string,
) {
  let parts = formatter.formatRangeToParts(startDate.toDate(timeZone), endDate.toDate(timeZone))
  let separatorIndex = -1
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i]
    if (part.source === "shared" && part.type === "literal") {
      separatorIndex = i
    } else if (part.source === "endRange") {
      break
    }
  }
  let start = ""
  let end = ""
  for (let i = 0; i < parts.length; i++) {
    if (i < separatorIndex) {
      start += parts[i].value
    } else if (i > separatorIndex) {
      end += parts[i].value
    }
  }
  return toString(start, end)
}

export function formatSelectedDate(startDate: DateValue, endDate: DateValue | null, locale: string, timeZone: string) {
  let start = startDate
  let end = endDate ?? startDate
  let formatter = getDayFormatter(locale, timeZone)
  if (isSameDay(start, end)) {
    return formatter.format(start.toDate(timeZone))
  }
  return formatRange(start, end, formatter, (start, end) => `${start} – ${end}`, timeZone)
}

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
