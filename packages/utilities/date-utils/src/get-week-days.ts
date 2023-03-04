import { CalendarDate, startOfWeek } from "@internationalized/date"
import { getWeekdayFormats } from "./get-weekday-formats"

export function getWeekDays(date: CalendarDate, timeZone: string, locale: string) {
  const weekStart = startOfWeek(date, locale)
  const weekArr = [...new Array(7).keys()]
  const getFormats = getWeekdayFormats(locale, timeZone)
  return weekArr.map((index) => getFormats(weekStart.add({ days: index })))
}
