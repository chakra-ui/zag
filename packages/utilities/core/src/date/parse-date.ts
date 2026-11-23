import { CalendarDate, DateFormatter } from "@internationalized/date"
import { normalizeYear } from "./date-year"
import type { DateValue } from "./types"

const isValidYear = (year: string | null | undefined): year is string => year != null && year.length === 4
const isValidMonth = (month: string | null | undefined): month is string =>
  month != null && parseFloat(month) >= 1 && parseFloat(month) <= 12
const isValidDay = (day: string | null | undefined): day is string =>
  day != null && parseFloat(day) >= 1 && parseFloat(day) <= 31

export function parseDateString(date: string, locale: string, timeZone: string): DateValue | undefined {
  const regex = createRegex(locale, timeZone)

  let { year, month, day } = extract(regex, date) ?? {}

  const hasMatch = year != null || month != null || day != null
  const typedDay = !!day

  if (hasMatch) {
    const curr = new Date()
    year ||= curr.getFullYear().toString()
    month ||= (curr.getMonth() + 1).toString()
    day ||= curr.getDate().toString()
  }

  if (!isValidYear(year)) {
    year = normalizeYear(year)
  }

  if (isValidYear(year) && isValidMonth(month) && isValidDay(day)) {
    const start = new CalendarDate(+year, +month, 1)
    const daysInMonth = start.calendar.getDaysInMonth(start)
    // A typed day the month doesn't have is invalid; today's day filled in is clamped
    if (typedDay && +day > daysInMonth) return undefined
    return start.set({ day: Math.min(+day, daysInMonth) })
  }

  // We should never get here, but just in case
  const time = Date.parse(date)
  if (!isNaN(time)) {
    const date = new Date(time)
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  }
}

function createRegex(locale: string, timeZone: string) {
  const formatter = new DateFormatter(locale, { day: "numeric", month: "numeric", year: "numeric", timeZone })
  const parts = formatter.formatToParts(new Date(2000, 11, 25))
  return parts.map(({ type, value }) => (type === "literal" ? `${value}?` : `((?!=<${type}>)\\d+)?`)).join("")
}

interface DateParts {
  year: string | null
  month: string | null
  day: string | null
}

type DatePart = keyof DateParts

function extract(pattern: string | RegExp, str: string) {
  const matches = str.match(pattern)
  return pattern
    .toString()
    .match(/<(.+?)>/g)
    ?.map((group) => {
      const groupMatches = group.match(/<(.+)>/)
      if (!groupMatches || groupMatches.length <= 0) {
        return null
      }
      return group.match(/<(.+)>/)?.[1]
    })
    .reduce((acc, curr, index) => {
      if (!curr) return acc
      if (matches && matches.length > index) {
        acc[curr as DatePart] = matches[index + 1]
      } else {
        acc[curr as DatePart] = null
      }
      return acc
    }, {} as DateParts)
}
