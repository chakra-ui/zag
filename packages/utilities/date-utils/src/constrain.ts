import {
  type CalendarDate,
  type DateDuration,
  type DateValue,
  maxDate,
  minDate,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toCalendarDate,
} from "@internationalized/date"

// Replaces the calendar portion of a date, keeping whatever time/zone it already carries.
function withCalendarDate<T extends DateValue>(date: T, next: CalendarDate): T {
  return date.set({ year: next.year, month: next.month, day: next.day }) as T
}

/* -----------------------------------------------------------------------------
 * Align date to start, end, or center of a duration
 * -----------------------------------------------------------------------------*/

// Every function below is generic so a caller that hands in a date-time gets date-times back.
// The operations already preserve the concrete type; only the annotations used to widen it.

export function alignCenter<T extends DateValue>(
  date: T,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): T {
  const halfDuration: DateDuration = {}

  for (let prop in duration) {
    const key = prop as keyof DateDuration

    const value = duration[key]
    if (value == null) continue

    halfDuration[key] = Math.floor(value / 2)

    if (halfDuration[key] > 0 && value % 2 === 0) {
      halfDuration[key]--
    }
  }

  const aligned = alignStart(date, duration, locale).subtract(halfDuration) as T

  return constrainStart(date, aligned, duration, locale, min, max)
}

export function alignStart<T extends DateValue>(
  date: T,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): T {
  // align to the start of the largest unit
  let aligned = date
  if (duration.years) {
    aligned = startOfYear(date) as T
  } else if (duration.months) {
    aligned = startOfMonth(date) as T
  } else if (duration.weeks) {
    aligned = startOfWeek(date, locale) as T
  }

  return constrainStart(date, aligned, duration, locale, min, max)
}

export function alignEnd<T extends DateValue>(
  date: T,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): T {
  let d: DateDuration = { ...duration }
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

  let aligned = alignStart(date, duration, locale).subtract(d) as T
  return constrainStart(date, aligned, duration, locale, min, max)
}

/* -----------------------------------------------------------------------------
 * Constrain a date to a min/max range
 * -----------------------------------------------------------------------------*/

export function constrainStart<T extends DateValue>(
  date: DateValue,
  aligned: T,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): T {
  // Bounds are aligned and compared date-only so a stray time component can't shift the
  // alignment, then written back onto `aligned` so its own time/zone survives the clamp.
  let result = aligned

  if (min && date.compare(min) >= 0) {
    const lower = alignStart(toCalendarDate(min), duration, locale)
    if (toCalendarDate(result).compare(lower) < 0) {
      result = withCalendarDate(result, lower)
    }
  }

  if (max && date.compare(max) <= 0) {
    const upper = alignEnd(toCalendarDate(max), duration, locale)
    if (toCalendarDate(result).compare(upper) > 0) {
      result = withCalendarDate(result, upper)
    }
  }

  return result
}

export function constrainValue<T extends DateValue>(date: T, minValue?: DateValue, maxValue?: DateValue): T {
  // Convert to CalendarDate for consistent date-only comparison
  const dateOnly = toCalendarDate(date)
  const minOnly = minValue ? toCalendarDate(minValue) : undefined
  const maxOnly = maxValue ? toCalendarDate(maxValue) : undefined

  // Determine if date needs adjustment
  let constrainedDateOnly = dateOnly

  if (minOnly) {
    constrainedDateOnly = maxDate(constrainedDateOnly, minOnly)!
  }

  if (maxOnly) {
    constrainedDateOnly = minDate(constrainedDateOnly, maxOnly)!
  }

  // If date didn't change, return original to preserve time components
  if (constrainedDateOnly.compare(dateOnly) === 0) {
    return date
  }

  return withCalendarDate(date, constrainedDateOnly)
}

// Clamp only the out-of-range date segments, preserving later segments when possible.
export function constrainSegments<T extends DateValue>(date: T, minValue?: DateValue, maxValue?: DateValue): T {
  const dateOnly = toCalendarDate(date)
  const minOnly = minValue ? toCalendarDate(minValue) : undefined
  const maxOnly = maxValue ? toCalendarDate(maxValue) : undefined

  let result = dateOnly

  if (minOnly && result.compare(minOnly) < 0) {
    if (result.year < minOnly.year) {
      result = result.set({ year: minOnly.year })
    }
    if (result.compare(minOnly) < 0 && result.month < minOnly.month) {
      result = result.set({ month: minOnly.month })
    }
    if (result.compare(minOnly) < 0 && result.day < minOnly.day) {
      result = result.set({ day: minOnly.day })
    }
  }

  if (maxOnly && result.compare(maxOnly) > 0) {
    if (result.year > maxOnly.year) {
      result = result.set({ year: maxOnly.year })
    }
    if (result.compare(maxOnly) > 0 && result.month > maxOnly.month) {
      result = result.set({ month: maxOnly.month })
    }
    if (result.compare(maxOnly) > 0 && result.day > maxOnly.day) {
      result = result.set({ day: maxOnly.day })
    }
  }

  if (result.compare(dateOnly) === 0) {
    return date
  }

  return withCalendarDate(date, result)
}
