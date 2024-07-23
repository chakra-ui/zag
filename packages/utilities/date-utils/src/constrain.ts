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
    aligned = maxDate(aligned, alignStart(toCalendarDate(min), duration, locale))!
  }

  if (max && date.compare(max) <= 0) {
    aligned = minDate(aligned, alignEnd(toCalendarDate(max), duration, locale))!
  }

  return aligned
}

export function constrainValue(date: DateValue, minValue?: DateValue, maxValue?: DateValue): DateValue {
  if (minValue) {
    date = maxDate(date, toCalendarDate(minValue))!
  }
  if (maxValue) {
    date = minDate(date, toCalendarDate(maxValue))!
  }
  return date
}
