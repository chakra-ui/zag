import { CalendarDate, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "@internationalized/date"
import { alignStart, constrainStart, constrainValue } from "./constrain"
import { getUnitDuration } from "./duration"
import { DateContext } from "./types"

/* -----------------------------------------------------------------------------
 *  Get next and previous page (for date range)
 * -----------------------------------------------------------------------------*/

export function getNextPage(ctx: DateContext, date: CalendarDate, startDate: CalendarDate) {
  const start = startDate.add(ctx.duration)
  return {
    startDate: alignStart(ctx, constrainStart(ctx, date, start)),
    focusedDate: constrainValue(ctx, date.add(ctx.duration)),
  }
}

export function getPreviousPage(ctx: DateContext, date: CalendarDate, startDate: CalendarDate) {
  const start = startDate.subtract(ctx.duration)
  return {
    startDate: alignStart(ctx, constrainStart(ctx, date, start)),
    focusedDate: constrainValue(ctx, date.subtract(ctx.duration)),
  }
}

/* -----------------------------------------------------------------------------
 * Get start and end date for a date section
 * -----------------------------------------------------------------------------*/

export function getSectionStart(ctx: DateContext, date: CalendarDate, startDate: CalendarDate) {
  const d = ctx.duration
  if (d.days) {
    return startDate
  }
  if (d.weeks) {
    return startOfWeek(date, ctx.locale)
  }
  if (d.months || d.years) {
    return startOfMonth(date)
  }
}

export function getSectionEnd(ctx: DateContext, date: CalendarDate, endDate: CalendarDate) {
  const d = ctx.duration
  if (d.days) {
    return endDate
  }
  if (d.weeks) {
    return endOfWeek(date, ctx.locale)
  }
  if (d.months || d.years) {
    return endOfMonth(date)
  }
}

export function getNextSection(ctx: DateContext, date: CalendarDate, larger?: boolean) {
  const d = ctx.duration
  const unitDuration = getUnitDuration(ctx.duration)

  if (!larger && !d.days) {
    return date.add(unitDuration)
  }
  if (d.days) {
    return date.add(d)
  }
  if (d.weeks) {
    return date.add({ months: 1 })
  }
  if (d.months || d.years) {
    return date.add({ years: 1 })
  }
}

export function getPreviousSection(ctx: DateContext, date: CalendarDate, larger?: boolean) {
  const d = ctx.duration
  const unitDuration = getUnitDuration(ctx.duration)
  if (!larger && !d.days) {
    return date.subtract(unitDuration)
  }
  if (d.days) {
    return date.subtract(ctx.duration)
  }
  if (d.weeks) {
    return date.subtract({ months: 1 })
  }
  if (d.months || d.years) {
    return date.subtract({ years: 1 })
  }
}

/* -----------------------------------------------------------------------------
 * Get the next and previous row (for date range)
 * -----------------------------------------------------------------------------*/

export function getNextRow(ctx: DateContext, date: CalendarDate, startDate: CalendarDate) {
  const d = ctx.duration
  if (d.days) {
    return getNextPage(ctx, date, startDate)
  }
  if (d.weeks || d.months || d.years) {
    return date.add({ weeks: 1 })
  }
}

export function getPreviousRow(ctx: DateContext, date: CalendarDate, startDate: CalendarDate) {
  const d = ctx.duration
  if (d.days) {
    return getPreviousPage(ctx, date, startDate)
  }
  if (d.weeks || d.months || d.years) {
    return date.subtract({ weeks: 1 })
  }
}
