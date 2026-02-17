import {
  type DateDuration,
  type DateValue,
  maxDate,
  minDate,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toCalendarDate,
} from "@internationalized/date"

/* -----------------------------------------------------------------------------
 * Align date to start, end, or center of a duration
 * -----------------------------------------------------------------------------*/

export function alignCenter(
  date: DateValue,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): DateValue {
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

  const aligned = alignStart(date, duration, locale).subtract(halfDuration)

  return constrainStart(date, aligned, duration, locale, min, max)
}

export function alignStart(
  date: DateValue,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): DateValue {
  // align to the start of the largest unit
  let aligned = date
  if (duration.years) {
    aligned = startOfYear(date)
  } else if (duration.months) {
    aligned = startOfMonth(date)
  } else if (duration.weeks) {
    aligned = startOfWeek(date, locale)
  }

  return constrainStart(date, aligned, duration, locale, min, max)
}

export function alignEnd(
  date: DateValue,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): DateValue {
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

  let aligned = alignStart(date, duration, locale).subtract(d)
  return constrainStart(date, aligned, duration, locale, min, max)
}

/* -----------------------------------------------------------------------------
 * Constrain a date to a min/max range
 * -----------------------------------------------------------------------------*/

export function constrainStart(
  date: DateValue,
  aligned: DateValue,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): DateValue {
  if (min && date.compare(min) >= 0) {
    // Ensure consistent date types by converting min to CalendarDate for alignment operations
    // This prevents time-component comparison issues in alignment calculations
    aligned = maxDate(aligned, alignStart(toCalendarDate(min), duration, locale))!
  }

  if (max && date.compare(max) <= 0) {
    // Ensure consistent date types by converting max to CalendarDate for alignment operations
    // This prevents time-component comparison issues in alignment calculations
    aligned = minDate(aligned, alignEnd(toCalendarDate(max), duration, locale))!
  }

  return aligned
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

  // Date changed - apply the date portion while preserving time if present
  // Check if original date has time components (CalendarDateTime or ZonedDateTime)
  if ("hour" in date) {
    return date.set({
      year: constrainedDateOnly.year,
      month: constrainedDateOnly.month,
      day: constrainedDateOnly.day,
    }) as T
  }

  // Original was CalendarDate, return the constrained CalendarDate
  return constrainedDateOnly as T
}
