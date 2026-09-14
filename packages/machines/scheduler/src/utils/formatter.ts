import { toCalendarDate } from "@internationalized/date"
import type { HourRange } from "../scheduler.types"
import type { DayBounds, TimeRange } from "./time"

export interface SchedulerFormatters {
  weekDayShort: Intl.DateTimeFormat
  weekDayLong: Intl.DateTimeFormat
  weekDayNarrow: Intl.DateTimeFormat
  time: Intl.DateTimeFormat
  range: Intl.DateTimeFormat
  longDate: Intl.DateTimeFormat
  month: Intl.DateTimeFormat
}

export function createFormatters(params: { locale: string; timeZone: string }): SchedulerFormatters {
  const { locale, timeZone } = params
  return {
    weekDayShort: new Intl.DateTimeFormat(locale, { timeZone, weekday: "short" }),
    weekDayLong: new Intl.DateTimeFormat(locale, { timeZone, weekday: "long" }),
    weekDayNarrow: new Intl.DateTimeFormat(locale, { timeZone, weekday: "narrow" }),
    time: new Intl.DateTimeFormat(locale, { timeZone, hour: "numeric", minute: "2-digit" }),
    range: new Intl.DateTimeFormat(locale, { timeZone, month: "short", day: "numeric", year: "numeric" }),
    longDate: new Intl.DateTimeFormat(locale, { timeZone, weekday: "long", month: "long", day: "numeric" }),
    month: new Intl.DateTimeFormat(locale, { timeZone, month: "long" }),
  }
}

/** Keyed by `CalendarDate` string, so a re-render costs a Map hit instead of N `format()` calls. */
export function createDayCellLabels(params: {
  locale: string
  timeZone: string
  range: TimeRange
}): Map<string, string> {
  const { locale, timeZone, range } = params
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  // ±7 days so a month grid's leading/trailing outside dates still hit the cache.
  let cur = toCalendarDate(range.start).subtract({ days: 7 })
  const stop = toCalendarDate(range.end).add({ days: 7 })
  const map = new Map<string, string>()
  while (cur.compare(stop) <= 0) {
    map.set(cur.toString(), formatter.format(cur.toDate(timeZone)))
    cur = cur.add({ days: 1 })
  }
  return map
}

export function createHourRange(params: DayBounds & { locale: string }): HourRange {
  const { dayStartHour, dayEndHour, locale } = params
  const hourSpan = dayEndHour - dayStartHour
  const formatter = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: "UTC" })
  return {
    start: dayStartHour,
    end: dayEndHour,
    hours: Array.from({ length: hourSpan + 1 }, (_, i) => {
      const value = dayStartHour + i
      const labelDate = new Date(Date.UTC(2020, 5, 15, Math.min(value, 23), 0))
      const percent = hourSpan === 0 ? 0 : i / hourSpan
      return { value, label: formatter.format(labelDate), percent }
    }),
  }
}
