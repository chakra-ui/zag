import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  now,
  startOfMonth,
  startOfWeek,
  startOfYear,
  type DateValue,
} from "@internationalized/date"

export type DateRangePreset =
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter"
  | "thisYear"
  | "lastYear"
  | "last3Days"
  | "last7Days"
  | "last14Days"
  | "last30Days"
  | "last90Days"

export function getDateRangePreset(preset: DateRangePreset, locale: string, timeZone: string): [DateValue, DateValue] {
  const today = now(timeZone)

  switch (preset) {
    case "thisWeek":
      return [startOfWeek(today, locale), endOfWeek(today, locale)]
    case "thisMonth":
      return [startOfMonth(today), today]
    case "thisQuarter":
      return [startOfMonth(today).add({ months: -today.month % 3 }), today]
    case "thisYear":
      return [startOfYear(today), today]
    case "last3Days":
      return [today.add({ days: -2 }), today]
    case "last7Days":
      return [today.add({ days: -6 }), today]
    case "last14Days":
      return [today.add({ days: -13 }), today]
    case "last30Days":
      return [today.add({ days: -29 }), today]
    case "last90Days":
      return [today.add({ days: -89 }), today]
    case "lastMonth":
      return [startOfMonth(today.add({ months: -1 })), endOfMonth(today.add({ months: -1 }))]
    case "lastQuarter":
      return [
        startOfMonth(today.add({ months: (-today.month % 3) - 3 })),
        endOfMonth(today.add({ months: (-today.month % 3) - 1 })),
      ]
    case "lastWeek":
      return [startOfWeek(today, locale).add({ weeks: -1 }), endOfWeek(today, locale).add({ weeks: -1 })]
    case "lastYear":
      return [startOfYear(today.add({ years: -1 })), endOfYear(today.add({ years: -1 }))]
    default:
      throw new Error(`Invalid date range preset: ${preset}`)
  }
}
