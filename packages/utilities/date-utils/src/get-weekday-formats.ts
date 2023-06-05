import { type DateValue, DateFormatter } from "@internationalized/date"

export function getWeekdayFormats(locale: string, timeZone: string) {
  const longFormat = new DateFormatter(locale, { weekday: "long", timeZone })
  const shortFormat = new DateFormatter(locale, { weekday: "short", timeZone })
  const narrowFormat = new DateFormatter(locale, { weekday: "narrow", timeZone })
  return <T extends DateValue | Date>(value: T) => {
    const date = value instanceof Date ? value : value.toDate(timeZone)
    return {
      value,
      short: shortFormat.format(date),
      long: longFormat.format(date),
      narrow: narrowFormat.format(date),
    }
  }
}
