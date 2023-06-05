import { type DateValue, getWeeksInMonth, isSameDay } from "@internationalized/date"
import { getStartOfWeek } from "./get-start-of-week"

export function getDaysInWeek(weekIndex: number, from: DateValue, locale: string, firstDayOfWeek?: number) {
  const weekDate = from.add({ weeks: weekIndex })
  const dates: DateValue[] = []
  let date = getStartOfWeek(weekDate, locale, firstDayOfWeek)
  while (dates.length < 7) {
    dates.push(date)
    let nextDate = date.add({ days: 1 })
    if (isSameDay(date, nextDate)) {
      break
    }
    date = nextDate
  }
  return dates
}

export function getMonthDays(from: DateValue, locale: string, numOfWeeks?: number, firstDayOfWeek?: number) {
  const monthWeeks = getWeeksInMonth(from, locale)
  const weeks = [...new Array(numOfWeeks ?? monthWeeks).keys()]
  return weeks.map((week) => getDaysInWeek(week, from, locale, firstDayOfWeek))
}
