import { DateDescriptionContext } from "./types"
import { getEraFormat } from "./get-era-format"

export function getDateFormatter(ctx: DateDescriptionContext) {
  const { start, end = start, getDateFormatter, timeZone } = ctx
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

export function getMonthFormatter(ctx: DateDescriptionContext) {
  const { start, end = start, getDateFormatter, timeZone } = ctx
  let era = getEraFormat(start) || getEraFormat(end)
  return getDateFormatter({
    month: "long",
    year: "numeric",
    era,
    calendar: start?.calendar.identifier,
    timeZone: timeZone,
  })
}
