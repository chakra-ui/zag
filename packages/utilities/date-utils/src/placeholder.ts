import { now, toCalendarDate } from "@internationalized/date"
import { DateGranularity } from "./types"

export function getTodayPlaceholderDate(timeZone: string) {
  return now(timeZone).set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  })
}

export function createPlaceholderDate(granularity: DateGranularity, timeZone: string) {
  let date = getTodayPlaceholderDate(timeZone)

  if (granularity === "year" || granularity === "month" || granularity === "day") {
    return toCalendarDate(date)
  }

  return date
}
