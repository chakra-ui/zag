import { getLocalTimeZone, toCalendarDateTime, today as todayDate, type DateValue } from "@internationalized/date"

/**
 * Returns today's date at midnight as a CalendarDateTime in the given (or
 * local) timezone.
 */
export function getToday(timeZone?: string) {
  return toCalendarDateTime(todayDate(timeZone ?? getLocalTimeZone()))
}

/**
 * Duration in minutes between two DateValues. Useful inside recurrence
 * expanders so user code doesn't reinvent the conversion.
 */
export function getDurationMinutes(start: DateValue, end: DateValue): number {
  const s = toCalendarDateTime(start)
  const e = toCalendarDateTime(end)
  return Math.round(e.compare(s) / 60000)
}
