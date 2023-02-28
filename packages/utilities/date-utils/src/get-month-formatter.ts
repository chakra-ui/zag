import { today, toCalendarDate } from "@internationalized/date"
import { getFormatter } from "./formatter"
import { getEraFormat } from "./get-era-format"

export function getMonthFormatter(locale: string, timeZone: string) {
  const date = toCalendarDate(today(timeZone))
  return getFormatter(locale, {
    month: "long",
    year: "numeric",
    era: getEraFormat(date),
    calendar: date?.calendar.identifier,
    timeZone: timeZone,
  })
}
