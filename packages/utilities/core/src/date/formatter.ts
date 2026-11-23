import { DateFormatter, toCalendarDateTime, today, type DateValue } from "@internationalized/date"
import { getEraFormat } from "./get-era-format"

export function getDayFormatter(locale: string, timeZone: string, referenceDate?: DateValue) {
  const date = referenceDate ?? toCalendarDateTime(today(timeZone))
  return new DateFormatter(locale, {
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    era: getEraFormat(date),
    calendar: date.calendar.identifier,
    timeZone,
  })
}

export function getMonthFormatter(locale: string, timeZone: string, referenceDate?: DateValue) {
  const date = referenceDate ?? today(timeZone)
  return new DateFormatter(locale, {
    month: "long",
    year: "numeric",
    era: getEraFormat(date),
    calendar: date.calendar.identifier,
    timeZone: timeZone,
  })
}
