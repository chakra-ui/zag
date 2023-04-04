import type { DateValue } from "@internationalized/date"
import { getWeekdayFormats } from "./get-weekday-formats"
import { getStartOfWeek } from "./get-start-of-week"

export function getWeekDays(date: DateValue, startOfWeekProp: number | undefined, timeZone: string, locale: string) {
  const firstDayOfWeek = getStartOfWeek(date, locale, startOfWeekProp)
  const weeks = [...new Array(7).keys()]
  const format = getWeekdayFormats(locale, timeZone)
  return weeks.map((index) => format(firstDayOfWeek.add({ days: index })))
}
