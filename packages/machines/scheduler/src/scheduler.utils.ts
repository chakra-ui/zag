import { getLocalTimeZone, toCalendarDateTime, today, type DateValue } from "@internationalized/date"

export function getToday(timeZone?: string) {
  return toCalendarDateTime(today(timeZone ?? getLocalTimeZone()))
}

export function getDurationMinutes(start: DateValue, end: DateValue): number {
  const s = toCalendarDateTime(start)
  const e = toCalendarDateTime(end)
  return Math.round(e.compare(s) / 60000)
}
