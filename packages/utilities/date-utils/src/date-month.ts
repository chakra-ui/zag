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

export function getStartOfWeek<T extends DateValue>(date: T, locale: string, firstDayOfWeek?: number): T {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek)
  return startOfWeek(date, locale, firstDay) as T
}

export function getEndOfWeek<T extends DateValue>(date: T, locale: string, firstDayOfWeek = 0): T {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek)
  return endOfWeek(date, locale, firstDay) as T
}

// Generic so a caller that hands in a date-time gets date-times back. Every step
// below preserves the concrete type; only the annotation used to widen it.
export function getDaysInWeek<T extends DateValue>(
  weekIndex: number,
  from: T,
  locale: string,
  firstDayOfWeek?: number,
): T[] {
  const weekDate = from.add({ weeks: weekIndex })
  const dates: T[] = []
  let date = getStartOfWeek(weekDate, locale, firstDayOfWeek) as T
  while (dates.length < 7) {
    dates.push(date)
    let nextDate = date.add({ days: 1 }) as T
    if (isSameDay(date, nextDate)) break
    date = nextDate
  }
  return dates
}

export function getMonthDays<T extends DateValue>(
  from: T,
  locale: string,
  numOfWeeks?: number,
  firstDayOfWeek?: number,
): T[][] {
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

export function getMonthNames(
  locale: string,
  format: Intl.DateTimeFormatOptions["month"] = "long",
  referenceDate?: DateValue,
) {
  if (
    !referenceDate ||
    referenceDate.calendar.identifier === "gregory" ||
    referenceDate.calendar.identifier === "iso8601"
  ) {
    const date = new Date(2021, 0, 1)
    const monthNames: string[] = []
    for (let i = 0; i < 12; i++) {
      monthNames.push(date.toLocaleString(locale, { month: format }))
      date.setMonth(date.getMonth() + 1)
    }
    return monthNames
  }

  const monthCount = referenceDate.calendar.getMonthsInYear(referenceDate)
  const formatter = new DateFormatter(locale, {
    month: format,
    calendar: referenceDate.calendar.identifier,
  })
  const monthNames: string[] = []
  for (let month = 1; month <= monthCount; month++) {
    const d = referenceDate.set({ month })
    monthNames.push(formatter.format(d.toDate("UTC")))
  }
  return monthNames
}

export function getWeekOfYear(date: DateValue, locale: string): number {
  const mondayOfWeek = startOfWeek(date, locale, "mon")
  const year = mondayOfWeek.year
  const jan4 = mondayOfWeek.set({ month: 1, day: 4 })
  const week1Monday = startOfWeek(jan4, locale, "mon")

  const julianMonday = mondayOfWeek.calendar.toJulianDay(mondayOfWeek)
  const julianWeek1 = week1Monday.calendar.toJulianDay(week1Monday)

  if (julianMonday >= julianWeek1) {
    return 1 + Math.floor((julianMonday - julianWeek1) / 7)
  }

  const prevJan4 = mondayOfWeek.set({ year: year - 1, month: 1, day: 4 })
  const prevWeek1Monday = startOfWeek(prevJan4, locale, "mon")
  const julianPrevWeek1 = prevWeek1Monday.calendar.toJulianDay(prevWeek1Monday)
  return 1 + Math.floor((julianMonday - julianPrevWeek1) / 7)
}
