import { CalendarDate, DateDuration, getWeeksInMonth } from "@internationalized/date"
import { getDatesInWeek } from "./get-week-dates"

export function getMonthDates(startDate: CalendarDate, duration: DateDuration, locale: string) {
  let weeksInMonth = getWeeksInMonth(startDate, locale)
  let numOfWeeks = duration.weeks ?? weeksInMonth
  let weeks = [...new Array(numOfWeeks).keys()]
  return weeks.map((week) => getDatesInWeek(week, startDate, locale))
}
