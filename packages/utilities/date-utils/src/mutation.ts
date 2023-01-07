import { Calendar, CalendarDate, GregorianCalendar, toCalendar, toCalendarDate, today } from "@internationalized/date"
import { constrainValue } from "./constrain"
import { isDateUnavailable } from "./assertion"
import { DateContext } from "./types"

export function clampDate(ctx: DateContext, date: CalendarDate) {
  return constrainValue(ctx, date)
}

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

export function setDate(ctx: DateContext, date: CalendarDate, nextDate: CalendarDate, startDate: CalendarDate) {
  let result: CalendarDate | undefined
  result = clampDate(ctx, nextDate)
  result = getPreviousAvailableDate(ctx, nextDate, startDate)

  if (!result) return
  result = toCalendar(result, date?.calendar || new GregorianCalendar())

  if (date && "hour" in date) {
    return date.set(result)
  }

  return result
}

function getPreviousAvailableDate(ctx: DateContext, date: CalendarDate, min?: CalendarDate) {
  const minValue = min ?? ctx.min
  if (!isDateUnavailable(ctx, date) || !minValue) {
    return date
  }
  while (date.compare(minValue) >= 0 && isDateUnavailable(ctx, date)) {
    date = date.subtract({ days: 1 })
  }
  if (date.compare(minValue) >= 0) {
    return date
  }
}
