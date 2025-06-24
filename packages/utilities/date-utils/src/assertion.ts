import { type DateValue, isSameDay } from "@internationalized/date"
import type { DateAvailableFn } from "./types"

export function isDateEqual(dateA: DateValue, dateB?: DateValue | null) {
  return dateB != null && isSameDay(dateA, dateB)
}

export function isDateUnavailable(
  date: DateValue | null,
  isUnavailable: DateAvailableFn | undefined,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null,
) {
  if (!date) return false
  if (isUnavailable?.(date, locale)) return true
  return isDateOutsideRange(date, minValue, maxValue)
}

export function isDateOutsideRange(date: DateValue, startDate?: DateValue | null, endDate?: DateValue | null) {
  return (startDate != null && date.compare(startDate) < 0) || (endDate != null && date.compare(endDate) > 0)
}

export function isPreviousRangeInvalid(startDate: DateValue, minValue?: DateValue | null, maxValue?: DateValue | null) {
  const prevDate = startDate.subtract({ days: 1 })
  return isSameDay(prevDate, startDate) || isDateOutsideRange(prevDate, minValue, maxValue)
}

export function isNextRangeInvalid(endDate: DateValue, minValue?: DateValue | null, maxValue?: DateValue | null) {
  const nextDate = endDate.add({ days: 1 })
  return isSameDay(nextDate, endDate) || isDateOutsideRange(nextDate, minValue, maxValue)
}
