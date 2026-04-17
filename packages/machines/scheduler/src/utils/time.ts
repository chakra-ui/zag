import { CalendarDateTime, toCalendarDate, type DateValue } from "@internationalized/date"

/** Extract { hour, minute } from any DateValue. CalendarDate has no time — returns midnight. */
export function getHourMinute(date: DateValue): { hour: number; minute: number } {
  const dt = date as { hour?: number; minute?: number }
  return { hour: dt.hour ?? 0, minute: dt.minute ?? 0 }
}

/** Number of minutes between two DateValues. Handles multi-day spans. */
export function getMinutesBetween(start: DateValue, end: DateValue): number {
  const startCal = toCalendarDate(start)
  const endCal = toCalendarDate(end)
  const dayDiff =
    endCal.year * 365 + endCal.month * 30 + endCal.day - (startCal.year * 365 + startCal.month * 30 + startCal.day)

  const { hour: sh, minute: sm } = getHourMinute(start)
  const { hour: eh, minute: em } = getHourMinute(end)
  return dayDiff * 24 * 60 + (eh - sh) * 60 + (em - sm)
}

/**
 * Vertical position of a datetime within a day grid as a 0–1 fraction.
 * Returns 0 if date is before dayStartHour, 1 if after dayEndHour.
 */
export function getTimePercent(date: DateValue, dayStartHour: number, dayEndHour: number): number {
  const { hour, minute } = getHourMinute(date)
  const totalMinutes = (dayEndHour - dayStartHour) * 60
  const elapsed = (hour - dayStartHour) * 60 + minute
  return Math.max(0, Math.min(1, elapsed / totalMinutes))
}

/** Snap a DateValue to the nearest slotInterval boundary. */
export function snapToSlot(date: DateValue, slotInterval: number): DateValue {
  const { hour, minute } = getHourMinute(date)
  const snapped = Math.round(minute / slotInterval) * slotInterval
  const finalHour = hour + Math.floor(snapped / 60)
  const finalMinute = snapped % 60
  const base = toCalendarDate(date)
  return new CalendarDateTime(base.year, base.month, base.day, finalHour, finalMinute)
}

/** Total number of slots in a day grid. */
export function getSlotCount(dayStartHour: number, dayEndHour: number, slotInterval: number): number {
  return ((dayEndHour - dayStartHour) * 60) / slotInterval
}

/** True if two DateValues represent the exact same instant. */
export function isSameDateValue(a: DateValue, b: DateValue): boolean {
  return a.compare(b) === 0
}

/** True if a DateValue falls between start (inclusive) and end (exclusive). */
export function isDateBetween(date: DateValue, start: DateValue, end: DateValue): boolean {
  return date.compare(start) >= 0 && date.compare(end) < 0
}

/** True if two time ranges overlap (half-open intervals). */
export function rangesOverlap(aStart: DateValue, aEnd: DateValue, bStart: DateValue, bEnd: DateValue): boolean {
  return aStart.compare(bEnd) < 0 && aEnd.compare(bStart) > 0
}

/** Number of whole days between two DateValues (ignores time). */
export function getDaysBetween(start: DateValue, end: DateValue): number {
  const s = toCalendarDate(start)
  const e = toCalendarDate(end)
  let count = 0
  let cur = s
  while (cur.compare(e) < 0) {
    cur = cur.add({ days: 1 })
    count++
  }
  return count
}
