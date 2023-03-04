import { toCalendarDate, today } from "@internationalized/date"
import { getFormatter } from "./formatter"
import { getEraFormat } from "./get-era-format"

export function getDayFormatter(locale: string, timeZone: string) {
  const date = toCalendarDate(today(timeZone))
  return getFormatter(locale, {
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    era: getEraFormat(date),
    timeZone,
  })
}
