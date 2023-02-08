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

/* -----------------------------------------------------------------------------
 * Align date to start, end, or center of a duration
 * -----------------------------------------------------------------------------*/

export function alignCenter(
  date: CalendarDate,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
) {
  let halfDuration: DateDuration = {}
  for (let key in duration) {
    halfDuration[key] = Math.floor(duration[key] / 2)
    if (halfDuration[key] > 0 && duration[key] % 2 === 0) {
      halfDuration[key]--
    }
  }

  let aligned = alignStart(date, duration, locale).subtract(halfDuration)
  return constrainStart(date, aligned, duration, locale, min, max)
}

export function alignStart(
  date: CalendarDate,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
) {
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

export function alignEnd(date: CalendarDate, duration: DateDuration, locale: string, min?: DateValue, max?: DateValue) {
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
  date: CalendarDate,
  aligned: CalendarDate,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
) {
  if (min && date.compare(min) >= 0) {
    aligned = maxDate(aligned, alignStart(toCalendarDate(min), duration, locale))
  }

  if (max && date.compare(max) <= 0) {
    aligned = minDate(aligned, alignEnd(toCalendarDate(max), duration, locale))
  }

  return aligned
}

export function constrainValue(date: CalendarDate, minValue?: DateValue, maxValue?: DateValue) {
  if (minValue) {
    date = maxDate(date, toCalendarDate(minValue))
  }
  if (maxValue) {
    date = minDate(date, toCalendarDate(maxValue))
  }
  return date
}
