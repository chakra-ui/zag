import { type DateValue, getWeeksInMonth, isSameDay, getDayOfWeek, startOfMonth } from "@internationalized/date"
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

export function getCustomWeeksInMonth(from: DateValue, locale: string, firstDayOfWeek?: number) {
  if (firstDayOfWeek == null) {
    return getWeeksInMonth(from, locale)
  }
  const paddingDays = (getDayOfWeek(startOfMonth(from), locale) - firstDayOfWeek + 7) % 7

  return Math.ceil((paddingDays + from.calendar.getDaysInMonth(from)) / 7)
}

export function getMonthDays(from: DateValue, locale: string, numOfWeeks?: number, firstDayOfWeek?: number) {
  const monthWeeks = numOfWeeks ?? getCustomWeeksInMonth(from, locale, firstDayOfWeek)

  const weeks = [...new Array(monthWeeks).keys()]
  return weeks.map((week) => getDaysInWeek(week, from, locale, firstDayOfWeek))
}
