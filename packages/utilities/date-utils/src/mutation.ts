import {
  type Calendar,
  type DateValue,
  getLocalTimeZone,
  toCalendar,
  toCalendarDateTime,
  today,
} from "@internationalized/date"
import { constrainValue } from "./constrain"
import type { DateAvailableFn } from "./types"

export function getTodayDate(timeZone?: string) {
  return today(timeZone ?? getLocalTimeZone())
}

export function setCalendar(date: DateValue, calendar: Calendar) {
  return toCalendar(toCalendarDateTime(date), calendar)
}

export function setDate(
  date: DateValue,
  startDate: DateValue,
  isDateUnavailable: DateAvailableFn,
  locale: string,
  minValue: DateValue,
  maxValue: DateValue,
) {
  let result: DateValue | undefined
  result = constrainValue(date, minValue, maxValue)
  result = getPreviousAvailableDate(date, startDate, locale, isDateUnavailable)
  return result
}

export function getPreviousAvailableDate(
  date: DateValue,
  minValue: DateValue,
  locale: string,
  isDateUnavailable?: DateAvailableFn,
) {
  if (!isDateUnavailable) {
    return date
  }

  while (date.compare(minValue) >= 0 && isDateUnavailable(date, locale)) {
    date = date.subtract({ days: 1 })
  }

  if (date.compare(minValue) >= 0) {
    return date
  }
}
