import { CalendarDateTime, toCalendarDate, type DateValue } from "@internationalized/date"
import { getDaysBetween } from "./time"

/**
 * Convert a pointer position to a DateValue.
 * gridRect is the bounding rect of the time-grid element.
 * referenceDate is any date in the visible range — used to determine the
 * calendar system (Gregorian, Buddhist, etc.)
 */
export function pointToDateTime(
  point: { x: number; y: number },
  gridRect: { left: number; top: number; width: number; height: number },
  visibleRange: { start: DateValue; end: DateValue },
  dayStartHour: number,
  dayEndHour: number,
  slotInterval: number,
): DateValue {
  const totalDays = getDaysBetween(visibleRange.start, visibleRange.end) + 1

  const relX = Math.max(0, Math.min(point.x - gridRect.left, gridRect.width - 1))
  const dayIndex = Math.floor((relX / gridRect.width) * totalDays)
  const targetDate = visibleRange.start.add({ days: dayIndex })

  const totalMinutes = (dayEndHour - dayStartHour) * 60
  const relY = Math.max(0, Math.min(point.y - gridRect.top, gridRect.height - 1))
  const rawMinutes = (relY / gridRect.height) * totalMinutes
  const snapped = Math.round(rawMinutes / slotInterval) * slotInterval
  const hour = Math.min(dayStartHour + Math.floor(snapped / 60), dayEndHour - 1)
  const minute = snapped % 60

  const base = toCalendarDate(targetDate)
  return new CalendarDateTime(base.year, base.month, base.day, hour, minute)
}

/**
 * Convert a pointer Y position to a time-only DateValue within the given reference date.
 * Used for resize operations where the day does not change.
 */
export function pointToTimeOnDay(
  pointY: number,
  gridTop: number,
  gridHeight: number,
  dayStartHour: number,
  dayEndHour: number,
  slotInterval: number,
  referenceDate: DateValue,
): DateValue {
  const totalMinutes = (dayEndHour - dayStartHour) * 60
  const relY = Math.max(0, Math.min(pointY - gridTop, gridHeight - 1))
  const rawMinutes = (relY / gridHeight) * totalMinutes
  const snapped = Math.round(rawMinutes / slotInterval) * slotInterval
  const hour = Math.min(dayStartHour + Math.floor(snapped / 60), dayEndHour - 1)
  const minute = snapped % 60
  const base = toCalendarDate(referenceDate)
  return new CalendarDateTime(base.year, base.month, base.day, hour, minute)
}
