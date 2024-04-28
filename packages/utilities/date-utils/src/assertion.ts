import { type DateValue, isSameDay, isToday } from "@internationalized/date"
import type { DateAvailableFn } from "./types"

export function isTodayDate(date: DateValue, timeZone: string) {
  return isToday(date, timeZone)
}

export function isDateEqual(dateA: DateValue, dateB?: DateValue | null) {
  return dateB != null && isSameDay(dateA, dateB)
}

export function isDateInvalid(date: DateValue, minValue?: DateValue | null, maxValue?: DateValue | null) {
  return (minValue != null && date.compare(minValue) < 0) || (maxValue != null && date.compare(maxValue) > 0)
}

export function isDateDisabled(
  date: DateValue,
  startDate: DateValue,
  endDate: DateValue,
  minValue?: DateValue | null,
  maxValue?: DateValue | null,
) {
  return isDateOutsideVisibleRange(date, startDate, endDate) || isDateInvalid(date, minValue, maxValue)
}

export function isDateUnavailable(
  date: DateValue | null,
  isUnavailable: DateAvailableFn | undefined,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null,
) {
  if (!date) {
    return false
  }
  if (isUnavailable?.(date, locale)) {
    return true
  }
  return isDateInvalid(date, minValue, maxValue)
}

export function isDateOutsideVisibleRange(date: DateValue, startDate: DateValue, endDate: DateValue) {
  return date.compare(startDate) < 0 || date.compare(endDate) > 0
}

export function isPreviousVisibleRangeInvalid(
  startDate: DateValue,
  minValue?: DateValue | null,
  maxValue?: DateValue | null,
) {
  const prevDate = startDate.subtract({ days: 1 })
  return isSameDay(prevDate, startDate) || isDateInvalid(prevDate, minValue, maxValue)
}

export function isNextVisibleRangeInvalid(
  endDate: DateValue,
  minValue?: DateValue | null,
  maxValue?: DateValue | null,
) {
  const nextDate = endDate.add({ days: 1 })
  return isSameDay(nextDate, endDate) || isDateInvalid(nextDate, minValue, maxValue)
}
