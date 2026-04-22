import { getLocalTimeZone, toCalendarDateTime, today as todayDate } from "@internationalized/date"

/**
 * Returns today's date at midnight as a CalendarDateTime in the given (or
 * local) timezone. Use this instead of hand-constructing a demo date so
 * examples and apps stay honest about the user's actual "now".
 */
export function getToday(timeZone?: string) {
  return toCalendarDateTime(todayDate(timeZone ?? getLocalTimeZone()))
}
