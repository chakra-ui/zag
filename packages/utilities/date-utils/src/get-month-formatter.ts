import { today, toCalendarDate, DateFormatter } from "@internationalized/date"
import { getEraFormat } from "./get-era-format"

export function getMonthFormatter(locale: string, timeZone: string) {
  const date = toCalendarDate(today(timeZone))
  return new DateFormatter(locale, {
    month: "long",
    year: "numeric",
    era: getEraFormat(date),
    calendar: date?.calendar.identifier,
    timeZone: timeZone,
  })
}
