import { CalendarDate, getDayOfWeek, getWeeksInMonth, isSameDay } from "@internationalized/date"

export function getStartOfWeek(date: CalendarDate, locale: string, firstDayOfWeek: number = 0) {
  const day = getDayOfWeek(date, locale)
  const diff = (day - firstDayOfWeek + 7) % 7
  return date.subtract({ days: diff })
}

export function getEndOfWeek(date: CalendarDate, locale: string, firstDayOfWeek: number = 0) {
  return getStartOfWeek(date, locale, firstDayOfWeek).add({ days: 6 })
}

export function getDaysInWeek(weekIndex: number, from: CalendarDate, locale: string, firstDayOfWeek?: number) {
  const weekDate = from.add({ weeks: weekIndex })
  const dates: (CalendarDate | null)[] = []
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

export function getMonthDays(from: CalendarDate, locale: string, numOfWeeks?: number, firstDayOfWeek?: number) {
  const monthWeeks = getWeeksInMonth(from, locale)
  const weeks = [...new Array(numOfWeeks ?? monthWeeks).keys()]
  return weeks.map((week) => {
    return getDaysInWeek(week, from, locale, firstDayOfWeek)
  })
}
