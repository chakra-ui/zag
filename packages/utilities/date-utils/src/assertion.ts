import { CalendarDate, DateValue, isSameDay, isToday } from "@internationalized/date"
import type { DateContext } from "./types"

export function isTodayDate(date: CalendarDate, timezone: string) {
  return isToday(date, timezone)
}

export function isDateEqual(dateA: CalendarDate, dateB: CalendarDate | null | undefined) {
  return dateB != null && isSameDay(dateA, dateB)
}

export function isDateInvalid(ctx: DateContext, date: DateValue) {
  return (ctx.min != null && date.compare(ctx.min) < 0) || (ctx.max != null && date.compare(ctx.max) > 0)
}

export function isDateDisabled(ctx: DateContext, date: DateValue, startDate: DateValue, endDate: DateValue) {
  return date.compare(startDate) < 0 || date.compare(endDate) > 0 || isDateInvalid(ctx, date)
}

export function isDateUnavailable(ctx: DateContext, date: DateValue | null) {
  if (!date) {
    return false
  }

  if (ctx.isUnavailable?.(date)) {
    return true
  }

  return isDateInvalid(ctx, date)
}

export function isDateOutsideVisibleRange(date: CalendarDate, startDate: CalendarDate, endDate: CalendarDate) {
  return date.compare(startDate) < 0 || date.compare(endDate) > 0
}

export function isPreviousVisibleRangeInvalid(ctx: DateContext, startDate: CalendarDate) {
  let prev = startDate.subtract({ days: 1 })
  return isSameDay(prev, startDate) || isDateInvalid(ctx, prev)
}

export function isNextVisibleRangeInvalid(ctx: DateContext, endDate: CalendarDate) {
  let next = endDate.add({ days: 1 })
  return isSameDay(next, endDate) || isDateInvalid(ctx, next)
}
