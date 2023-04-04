import { DateFormatter, toCalendarDateTime, today } from "@internationalized/date"
import { getEraFormat } from "./get-era-format"

export function getDayFormatter(locale: string, timeZone: string) {
  const date = toCalendarDateTime(today(timeZone))
  return new DateFormatter(locale, {
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    era: getEraFormat(date),
    timeZone,
  })
}
