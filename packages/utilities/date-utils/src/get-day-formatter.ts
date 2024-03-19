import { DateFormatter, toCalendarDateTime, today, now } from "@internationalized/date"
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

export function getNowFormatter(locale: string, timeZone: string) {
  const date = toCalendarDateTime(now(timeZone))
  return new DateFormatter(locale, {
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    era: getEraFormat(date),
    timeZone,
  })
}
