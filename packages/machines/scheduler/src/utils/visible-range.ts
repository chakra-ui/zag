import { endOfMonth, endOfWeek, startOfMonth, startOfWeek, type DateValue } from "@internationalized/date"
import type { ViewType } from "../scheduler.types"

/**
 * Identifier tokens consumed by `@internationalized/date`'s startOfWeek/endOfWeek
 * `firstDay` parameter. NOT display labels — those come from Intl.DateTimeFormat
 * via `getWeekDays`, which is locale/RTL aware.
 */
const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const
type DayOfWeek = (typeof DAY_NAMES)[number]

export function toDayOfWeekToken(n?: number): DayOfWeek | undefined {
  return n == null ? undefined : DAY_NAMES[n]
}

function toDayOfWeek(n?: number): DayOfWeek | undefined {
  return toDayOfWeekToken(n)
}

export function getVisibleRange(
  view: ViewType,
  date: DateValue,
  locale: string,
  firstDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6,
): { start: DateValue; end: DateValue } {
  const wsd = toDayOfWeek(firstDay)
  switch (view) {
    case "day":
      return { start: date, end: date }

    case "week":
      return {
        start: startOfWeek(date, locale, wsd),
        end: endOfWeek(date, locale, wsd),
      }

    case "month": {
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      return {
        start: startOfWeek(monthStart, locale, wsd),
        end: endOfWeek(monthEnd, locale, wsd),
      }
    }

    case "year":
      return {
        start: startOfMonth(date.set({ month: 1 })),
        end: endOfMonth(date.set({ month: 12 })),
      }

    case "agenda":
      return {
        start: date,
        end: date.add({ days: 30 }),
      }
  }
}

export function getNextDate(view: ViewType, date: DateValue): DateValue {
  switch (view) {
    case "day":
      return date.add({ days: 1 })
    case "week":
      return date.add({ weeks: 1 })
    case "month":
      return date.add({ months: 1 })
    case "year":
      return date.add({ years: 1 })
    case "agenda":
      return date.add({ days: 30 })
  }
}

export function getPrevDate(view: ViewType, date: DateValue): DateValue {
  switch (view) {
    case "day":
      return date.subtract({ days: 1 })
    case "week":
      return date.subtract({ weeks: 1 })
    case "month":
      return date.subtract({ months: 1 })
    case "year":
      return date.subtract({ years: 1 })
    case "agenda":
      return date.subtract({ days: 30 })
  }
}
