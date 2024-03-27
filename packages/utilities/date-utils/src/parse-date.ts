import { CalendarDate, CalendarDateTime, DateFormatter, type DateValue } from "@internationalized/date"

const isValidYear = (year: string | undefined): year is string => year != null && year.length === 4
const isValidMonth = (month: string | undefined): month is string => month != null && parseFloat(month) <= 12
const isValidDay = (day: string | undefined): day is string => day != null && parseFloat(day) <= 31
const isValidHour = (hour: string | undefined): hour is string => hour != null && parseFloat(hour) < 24
const isValidMinute = (minute: string | undefined): minute is string => minute != null && parseFloat(minute) < 60

export function parseDateString(date: string, locale: string, timeZone: string): DateValue | undefined {
  const regex = createRegex(locale, timeZone)

  let { year, month, day } = extract(regex, date) ?? {}

  const hasMatch = year != null || month != null || day != null

  if (hasMatch) {
    const curr = new Date()
    year ||= curr.getFullYear().toString()
    month ||= (curr.getMonth() + 1).toString()
    day ||= curr.getDate().toString()
  }

  if (isValidYear(year) && isValidMonth(month) && isValidDay(day)) {
    return new CalendarDate(+year, +month, +day)
  }

  // We should never get here, but just in case
  const time = Date.parse(date)
  if (!isNaN(time)) {
    const date = new Date(time)
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  }
}

export function parseDateTimeString(dateTimeString: string, locale: string, timeZone: string): DateValue | undefined {
  const regex = createDateTimeRegex(locale, timeZone)
  let { year, month, day, hour, minute } = extractDateTime(regex, dateTimeString) ?? {}

  const hasMatch = year != null || month != null || day != null || hour != null || minute != null

  if (hasMatch) {
    const curr = new Date()
    year ||= curr.getFullYear().toString()
    month ||= (curr.getMonth() + 1).toString()
    day ||= curr.getDate().toString()
    hour ||= curr.getHours().toString()
    minute ||= curr.getMinutes().toString()
  }

  if (isValidYear(year) && isValidMonth(month) && isValidDay(day) && isValidHour(hour) && isValidMinute(minute)) {
    return new CalendarDateTime(+year, +month, +day, +hour, +minute)
  }

  const time = Date.parse(dateTimeString)
  if (!isNaN(time)) {
    const dateTime = new Date(time)
    return new CalendarDateTime(
      dateTime.getFullYear(),
      dateTime.getMonth() + 1,
      dateTime.getDate(),
      dateTime.getHours(),
      dateTime.getMinutes(),
    )
  }
}

function createRegex(locale: string, timeZone: string) {
  const formatter = new DateFormatter(locale, { day: "numeric", month: "numeric", year: "numeric", timeZone })
  const parts = formatter.formatToParts(new Date(2000, 11, 25))
  return parts.map(({ type, value }) => (type === "literal" ? `${value}?` : `((?!=<${type}>)\\d+)?`)).join("")
}

function createDateTimeRegex(locale: string, timeZone: string) {
  const formatter = new DateFormatter(locale, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    hour12: false,
  })
  const parts = formatter.formatToParts(new Date(2000, 11, 25, 22, 23))
  return parts
    .map(({ type, value }) => {
      if (type === "literal") {
        return value === ", " ? " ?" : `${value}?`
      } else {
        return `((?!=<${type}>)\\d+)?`
      }
    })
    .join("")
}

interface DateParts {
  year: string
  month: string
  day: string
}

interface DateTimeParts {
  year: string
  month: string
  day: string
  hour: string
  minute: string
}

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
        acc[curr] = matches[index + 1]
      } else {
        acc[curr] = null
      }
      return acc
    }, {} as DateParts)
}

function extractDateTime(pattern: string | RegExp, str: string) {
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
        acc[curr] = matches[index + 1]
      } else {
        acc[curr] = null
      }
      return acc
    }, {} as DateTimeParts)
}
