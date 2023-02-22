import { Calendar, CalendarDate, DateValue, toCalendar, toCalendarDate, today } from "@internationalized/date"
import { constrainValue } from "./constrain"
import type { DateAvailableFn } from "./types"

export function getTodayDate(timezone: string) {
  return today(timezone)
}

export function getNextDay(date: CalendarDate) {
  return date.add({ days: 1 })
}

export function getPreviousDay(date: CalendarDate) {
  return date.subtract({ days: 1 })
}

export function setMonth(date: CalendarDate, month: number) {
  return date.set({ month })
}

export function setYear(date: CalendarDate, year: number) {
  return date.set({ year })
}

export function setCalendar(date: CalendarDate, calendar: Calendar) {
  return toCalendar(toCalendarDate(date), calendar)
}

export function setDate(
  date: CalendarDate,
  startDate: CalendarDate,
  isDateUnavailable: DateAvailableFn,
  minValue: CalendarDate,
  maxValue: CalendarDate,
) {
  let result: CalendarDate | undefined
  result = constrainValue(date, minValue, maxValue)
  result = getPreviousAvailableDate(date, startDate, isDateUnavailable)
  return result
}

export function getPreviousAvailableDate(date: CalendarDate, minValue: DateValue, isDateUnavailable?: DateAvailableFn) {
  if (!isDateUnavailable) {
    return date
  }

  while (date.compare(minValue) >= 0 && isDateUnavailable(date)) {
    date = date.subtract({ days: 1 })
  }

  if (date.compare(minValue) >= 0) {
    return date
  }
}
