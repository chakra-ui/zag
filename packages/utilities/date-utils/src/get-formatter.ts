import { CalendarDate } from "@internationalized/date"
import { GetFormatterFn } from "./types"

function getEraFormat(date: CalendarDate | undefined): "short" | undefined {
  return date?.calendar.identifier === "gregory" && date.era === "BC" ? "short" : undefined
}

export function getDateFormatter(
  startDate: CalendarDate,
  endDate: CalendarDate | null,
  getDateFormatter: GetFormatterFn,
  timeZone: string,
) {
  let start = startDate
  let end = endDate ?? startDate
  let era = getEraFormat(start) || getEraFormat(end)

  return getDateFormatter({
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    era,
    timeZone,
  })
}

export function getMonthFormatter(
  startDate: CalendarDate,
  endDate: CalendarDate | null,
  getDateFormatter: GetFormatterFn,
  timeZone: string,
) {
  let start = startDate
  let end = endDate ?? startDate
  let era = getEraFormat(start) || getEraFormat(end)

  return getDateFormatter({
    month: "long",
    year: "numeric",
    era,
    calendar: start?.calendar.identifier,
    timeZone: timeZone,
  })
}
