import { CalendarDate, DateDuration, getWeeksInMonth } from "@internationalized/date"
import { getDatesInWeek } from "./get-week-dates"

export function getMonthDates(startDate: CalendarDate, duration: DateDuration, locale: string) {
  let weeksInMonth = getWeeksInMonth(startDate, locale)

  let numOfWeeks = duration.weeks ?? weeksInMonth
  let weekArr = [...new Array(numOfWeeks).keys()]

  return weekArr.map((index) => {
    return getDatesInWeek(index, startDate, locale)
  })
}
