import {
  getLocalTimeZone,
  toCalendarDate,
  toCalendarDateTime,
  today,
  type CalendarDateTime,
} from "@internationalized/date"

export function getMinutesSinceMidnight(date: CalendarDateTime): number {
  return date.hour * 60 + date.minute
}

// `compare` can't be used here: it yields milliseconds within a day but whole days across one.
export function getMinutesBetween(start: CalendarDateTime, end: CalendarDateTime): number {
  const days = getDaysBetween(start, end)
  return days * 24 * 60 + getMinutesSinceMidnight(end) - getMinutesSinceMidnight(start)
}

export interface DayBounds {
  dayStartHour: number
  dayEndHour: number
}

export interface TimeRange {
  start: CalendarDateTime
  end: CalendarDateTime
}

/** Top/height within a day column, as CSS percentages. */
export function getTimeRangeBounds(params: TimeRange & DayBounds) {
  const { start, end, ...bounds } = params
  const s = getTimePercent({ date: start, ...bounds })
  const e = getTimePercent({ date: end, ...bounds })
  return { top: `${s * 100}%`, height: `${(e - s) * 100}%` }
}

/** Position within the day grid as a 0–1 fraction, clamped at both edges. */
export function getTimePercent(params: { date: CalendarDateTime } & DayBounds): number {
  const { date, dayStartHour, dayEndHour } = params
  const totalMinutes = (dayEndHour - dayStartHour) * 60
  const elapsed = getMinutesSinceMidnight(date) - dayStartHour * 60
  return Math.max(0, Math.min(1, elapsed / totalMinutes))
}

/** Half-open intervals: touching ranges do not overlap. */
export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.start.compare(b.end) < 0 && a.end.compare(b.start) > 0
}

/** Signed, and ignores the time component. */
export function getDaysBetween(start: CalendarDateTime, end: CalendarDateTime): number {
  // CalendarDate#compare returns an exact day difference
  return toCalendarDate(end).compare(toCalendarDate(start))
}

export const minDateTime = (a: CalendarDateTime, b: CalendarDateTime) => (a.compare(b) <= 0 ? a : b)
export const maxDateTime = (a: CalendarDateTime, b: CalendarDateTime) => (a.compare(b) >= 0 ? a : b)

/** Midnight on the date's own day. All-day events sit at midnight on both ends. */
export function startOfDay(date: CalendarDateTime): CalendarDateTime {
  return date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
}

/** Today in `timeZone`, as a wall-clock date-time. */
export function getToday(timeZone?: string): CalendarDateTime {
  return toCalendarDateTime(today(timeZone ?? getLocalTimeZone()))
}

/** e.g. `1h 30m`. Clamped at zero for inverted ranges. */
export function formatDuration(start: CalendarDateTime, end: CalendarDateTime): string {
  const diff = Math.max(0, getMinutesBetween(start, end))
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}
