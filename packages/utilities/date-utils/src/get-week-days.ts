import { CalendarDate, getDayOfWeek } from "@internationalized/date"
import { getWeekdayFormats } from "./get-weekday-formats"

export function startOfWeek(date: CalendarDate, startOfWeekProp: number | undefined, locale: string) {
  let dayOfWeek = startOfWeekProp ?? getDayOfWeek(date, locale)
  return date.subtract({ days: dayOfWeek })
}

export function getWeekDays(date: CalendarDate, startOfWeekProp: number | undefined, timeZone: string, locale: string) {
  const firstDayOfWeek = startOfWeek(date, startOfWeekProp, locale)
  const weeks = [...new Array(7).keys()]
  const format = getWeekdayFormats(locale, timeZone)
  return weeks.map((index) => format(firstDayOfWeek.add({ days: index })))
}
