import {
  DateFormatter,
  type DateValue,
  endOfWeek,
  getWeeksInMonth,
  isSameDay,
  startOfWeek,
} from "@internationalized/date"

const daysOfTheWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const
type DaysOfTheWeek = (typeof daysOfTheWeek)[number]
function normalizeFirstDayOfWeek(firstDayOfWeek?: number): DaysOfTheWeek | undefined {
  return firstDayOfWeek != null ? daysOfTheWeek[firstDayOfWeek] : undefined
}

export function getStartOfWeek(date: DateValue, locale: string, firstDayOfWeek?: number) {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek)
  return startOfWeek(date, locale, firstDay)
}

export function getEndOfWeek(date: DateValue, locale: string, firstDayOfWeek = 0) {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek)
  return endOfWeek(date, locale, firstDay)
}

export function getDaysInWeek(weekIndex: number, from: DateValue, locale: string, firstDayOfWeek?: number) {
  const weekDate = from.add({ weeks: weekIndex })
  const dates: DateValue[] = []
  let date = getStartOfWeek(weekDate, locale, firstDayOfWeek)
  while (dates.length < 7) {
    dates.push(date)
    let nextDate = date.add({ days: 1 })
    if (isSameDay(date, nextDate)) break
    date = nextDate
  }
  return dates
}

export function getMonthDays(from: DateValue, locale: string, numOfWeeks?: number, firstDayOfWeek?: number) {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek)
  const monthWeeks = numOfWeeks ?? getWeeksInMonth(from, locale, firstDay)
  const weeks = [...new Array(monthWeeks).keys()]
  return weeks.map((week) => getDaysInWeek(week, from, locale, firstDayOfWeek))
}

export function getWeekdayFormats(locale: string, timeZone: string) {
  const longFormat = new DateFormatter(locale, { weekday: "long", timeZone })
  const shortFormat = new DateFormatter(locale, { weekday: "short", timeZone })
  const narrowFormat = new DateFormatter(locale, { weekday: "narrow", timeZone })
  return <T extends DateValue | Date>(value: T) => {
    const date = value instanceof Date ? value : value.toDate(timeZone)
    return {
      value,
      short: shortFormat.format(date),
      long: longFormat.format(date),
      narrow: narrowFormat.format(date),
    }
  }
}

export function getWeekDays(date: DateValue, startOfWeekProp: number | undefined, timeZone: string, locale: string) {
  const firstDayOfWeek = getStartOfWeek(date, locale, startOfWeekProp)
  const weeks = [...new Array(7).keys()]
  const format = getWeekdayFormats(locale, timeZone)
  return weeks.map((index) => format(firstDayOfWeek.add({ days: index })))
}

export function getMonthNames(locale: string, format: Intl.DateTimeFormatOptions["month"] = "long") {
  const date = new Date(2021, 0, 1)
  const monthNames: string[] = []
  for (let i = 0; i < 12; i++) {
    monthNames.push(date.toLocaleString(locale, { month: format }))
    date.setMonth(date.getMonth() + 1)
  }
  return monthNames
}
