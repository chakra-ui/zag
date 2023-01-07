import {
  CalendarDate,
  DateDuration,
  maxDate,
  minDate,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toCalendarDate,
} from "@internationalized/date"
import { DateContext } from "./types"

/* -----------------------------------------------------------------------------
 * Align date to start, end, or center of a duration
 * -----------------------------------------------------------------------------*/

export function alignCenter(ctx: DateContext, date: CalendarDate) {
  const { duration } = ctx

  let halfDuration: DateDuration = {}

  for (let key in duration) {
    halfDuration[key] = Math.floor(duration[key] / 2)

    if (halfDuration[key] > 0 && duration[key] % 2 === 0) {
      halfDuration[key]--
    }
  }

  let aligned = alignStart(ctx, date).subtract(halfDuration)

  return constrainStart(ctx, date, aligned)
}

export function alignStart(ctx: DateContext, date: CalendarDate) {
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

  return constrainStart(ctx, date, aligned)
}

export function alignEnd(ctx: DateContext, date: CalendarDate) {
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

  let aligned = alignStart(ctx, date).subtract(d)

  return constrainStart(ctx, date, aligned)
}

/* -----------------------------------------------------------------------------
 * Constrain a date to a min/max range
 * -----------------------------------------------------------------------------*/

export function constrainValue(ctx: DateContext, date: CalendarDate) {
  let { min, max } = ctx

  if (min) {
    date = maxDate(date, toCalendarDate(min))
  }

  if (max) {
    date = minDate(date, toCalendarDate(max))
  }

  return date
}

export function constrainStart(ctx: DateContext, date: CalendarDate, aligned: CalendarDate) {
  let { min, max } = ctx

  if (min && date.compare(min) >= 0) {
    aligned = maxDate(aligned, alignStart(ctx, toCalendarDate(min)))
  }

  if (max && date.compare(max) <= 0) {
    aligned = minDate(aligned, alignEnd(ctx, toCalendarDate(max)))
  }

  return aligned
}
