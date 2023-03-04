import type { CalendarDate } from "@internationalized/date"
import { getFormatter } from "./formatter"

export function getWeekdayFormats(locale: string, timeZone: string) {
  const longFormat = getFormatter(locale, { weekday: "long", timeZone })
  const shortFormat = getFormatter(locale, { weekday: "short", timeZone })
  const narrowFormat = getFormatter(locale, { weekday: "narrow", timeZone })
  return <T extends CalendarDate | Date>(value: T) => {
    const date = value instanceof Date ? value : value.toDate(timeZone)
    return {
      value,
      short: shortFormat.format(date),
      long: longFormat.format(date),
      narrow: narrowFormat.format(date),
    }
  }
}
