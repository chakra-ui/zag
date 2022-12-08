import {
  CalendarDate,
  DateDuration,
  DateValue,
  maxDate,
  minDate,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toCalendarDate,
} from "@internationalized/date"
import type { DateContext } from "./types"

/* -----------------------------------------------------------------------------
 * Align date to start, end, or center of a duration
 * -----------------------------------------------------------------------------*/

export function alignCenter(date: CalendarDate, ctx: DateContext) {
  const { duration } = ctx

  let halfDuration: DateDuration = {}

  for (let key in duration) {
    halfDuration[key] = Math.floor(duration[key] / 2)
    if (halfDuration[key] > 0 && duration[key] % 2 === 0) {
      halfDuration[key]--
    }
  }

  let aligned = alignStart(date, ctx).subtract(halfDuration)

  return constrainStart(date, aligned, ctx)
}

export function alignStart(date: CalendarDate, ctx: DateContext) {
  let { locale, duration } = ctx

  // align to the start of the largest unit
  let aligned = date

  if (duration.years) {
    aligned = startOfYear(date)
  } else if (duration.months) {
    aligned = startOfMonth(date)
  } else if (duration.weeks) {
    aligned = startOfWeek(date, locale)
  }

  return constrainStart(date, aligned, ctx)
}

export function alignEnd(date: CalendarDate, ctx: DateContext) {
  const { duration } = ctx
  let d = { ...duration }
  // subtract 1 from the smallest unit
  if (d.days) {
    d.days--
  } else if (d.weeks) {
    d.weeks--
  } else if (d.months) {
    d.months--
  } else if (d.years) {
    d.years--
  }

  let aligned = alignStart(date, ctx).subtract(d)

  return constrainStart(date, aligned, ctx)
}

/* -----------------------------------------------------------------------------
 * Constrain a date to a min/max range
 * -----------------------------------------------------------------------------*/

export function constrainValue(date: CalendarDate, ctx: { min?: DateValue; max?: DateValue } = {}) {
  let { min, max } = ctx

  if (min) {
    date = maxDate(date, toCalendarDate(min))
  }

  if (max) {
    date = minDate(date, toCalendarDate(max))
  }

  return date
}

export function constrainStart(date: CalendarDate, aligned: CalendarDate, ctx: DateContext) {
  let { min, max } = ctx

  if (min && date.compare(min) >= 0) {
    aligned = maxDate(aligned, alignStart(toCalendarDate(min), ctx))
  }

  if (max && date.compare(max) <= 0) {
    aligned = minDate(aligned, alignEnd(toCalendarDate(max), ctx))
  }

  return aligned
}
