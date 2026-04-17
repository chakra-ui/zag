import { endOfMonth, endOfWeek, startOfMonth, startOfWeek, type DateValue } from "@internationalized/date"
import type { ViewType } from "../scheduler.types"

export function getVisibleRange(view: ViewType, date: DateValue, locale: string): { start: DateValue; end: DateValue } {
  switch (view) {
    case "day":
      return { start: date, end: date }

    case "week":
      return {
        start: startOfWeek(date, locale),
        end: endOfWeek(date, locale),
      }

    case "month": {
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      // Extend to full weeks so the month grid always shows complete rows
      return {
        start: startOfWeek(monthStart, locale),
        end: endOfWeek(monthEnd, locale),
      }
    }

    case "year":
      return {
        start: startOfMonth(date.set({ month: 1 })),
        end: endOfMonth(date.set({ month: 12 })),
      }

    case "agenda":
      // 30-day rolling window from the focused date
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
