import { type DateDuration, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "@internationalized/date"
import { isDateOutsideRange } from "./assertion"
import { alignEnd, alignStart, constrainStart, constrainValue } from "./constrain"
import { getEndDate, getUnitDuration } from "./duration"
import type { DateValue } from "./types"

export interface AdjustDateParams<T extends DateValue = DateValue> {
  startDate: T
  focusedDate: T
}

export interface AdjustDateReturn<T extends DateValue = DateValue> extends AdjustDateParams<T> {
  endDate: T
}

// Generic throughout so paging a date-time returns date-times. Every operation already
// preserves the concrete type; only the annotations used to widen it.
export function getAdjustedDateFn(
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  return function getDate<T extends DateValue>(options: AdjustDateParams<T>): AdjustDateReturn<T> {
    const { startDate, focusedDate } = options
    const endDate = getEndDate(startDate, visibleDuration) as T

    // If the focused date was moved to an invalid value, it can't be focused, so constrain it.
    if (isDateOutsideRange(focusedDate, minValue, maxValue)) {
      return {
        startDate,
        focusedDate: constrainValue(focusedDate, minValue, maxValue),
        endDate,
      }
    }

    if (focusedDate.compare(startDate) < 0) {
      return {
        startDate: alignEnd(focusedDate, visibleDuration, locale, minValue, maxValue),
        focusedDate: constrainValue(focusedDate, minValue, maxValue),
        endDate,
      }
    }

    if (focusedDate.compare(endDate) > 0) {
      return {
        startDate: alignStart(focusedDate, visibleDuration, locale, minValue, maxValue),
        endDate,
        focusedDate: constrainValue(focusedDate, minValue, maxValue),
      }
    }

    return {
      startDate,
      endDate,
      focusedDate: constrainValue(focusedDate, minValue, maxValue),
    }
  }
}

/* -----------------------------------------------------------------------------
 *  Get next and previous page (for date range)
 * -----------------------------------------------------------------------------*/

export function getNextPage<T extends DateValue>(
  focusedDate: T,
  startDate: T,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)
  const start = startDate.add(visibleDuration) as T

  return adjust({
    focusedDate: focusedDate.add(visibleDuration) as T,
    startDate: alignStart(
      constrainStart(focusedDate, start, visibleDuration, locale, minValue, maxValue),
      visibleDuration,
      locale,
    ),
  })
}

export function getPreviousPage<T extends DateValue>(
  focusedDate: T,
  startDate: T,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)
  let start = startDate.subtract(visibleDuration) as T

  return adjust({
    focusedDate: focusedDate.subtract(visibleDuration) as T,
    startDate: alignStart(
      constrainStart(focusedDate, start, visibleDuration, locale, minValue, maxValue),
      visibleDuration,
      locale,
    ),
  })
}

/* -----------------------------------------------------------------------------
 * Get the next and previous row (for date range)
 * -----------------------------------------------------------------------------*/

export function getNextRow<T extends DateValue>(
  focusedDate: T,
  startDate: T,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)

  if (visibleDuration.days) {
    return getNextPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue)
  }

  if (visibleDuration.weeks || visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: focusedDate.add({ weeks: 1 }) as T,
      startDate,
    })
  }
}

export function getPreviousRow<T extends DateValue>(
  focusedDate: T,
  startDate: T,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)

  if (visibleDuration.days) {
    return getPreviousPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue)
  }

  if (visibleDuration.weeks || visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: focusedDate.subtract({ weeks: 1 }) as T,
      startDate,
    })
  }
}

/* -----------------------------------------------------------------------------
 * Get start and end date for a date section
 * -----------------------------------------------------------------------------*/

export function getSectionStart<T extends DateValue>(
  focusedDate: T,
  startDate: T,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)

  if (visibleDuration.days) {
    return adjust({
      focusedDate: startDate,
      startDate,
    })
  }

  if (visibleDuration.weeks) {
    return adjust({
      focusedDate: startOfWeek(focusedDate, locale) as T,
      startDate,
    })
  }

  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: startOfMonth(focusedDate) as T,
      startDate,
    })
  }
}

export function getSectionEnd<T extends DateValue>(
  focusedDate: T,
  startDate: T,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)
  const endDate = getEndDate(startDate, visibleDuration) as T

  if (visibleDuration.days) {
    return adjust({
      focusedDate: endDate,
      startDate,
    })
  }

  if (visibleDuration.weeks) {
    return adjust({
      focusedDate: endOfWeek(focusedDate, locale) as T,
      startDate,
    })
  }

  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: endOfMonth(focusedDate) as T,
      startDate,
    })
  }
}

export function getNextSection<T extends DateValue>(
  focusedDate: T,
  startDate: T,
  larger: boolean,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)

  if (!larger && !visibleDuration.days) {
    return adjust({
      focusedDate: focusedDate.add(getUnitDuration(visibleDuration)) as T,
      startDate,
    })
  }

  if (visibleDuration.days) {
    return getNextPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue)
  }

  if (visibleDuration.weeks) {
    return adjust({
      focusedDate: focusedDate.add({ months: 1 }) as T,
      startDate,
    })
  }

  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: focusedDate.add({ years: 1 }) as T,
      startDate,
    })
  }
}

export function getPreviousSection<T extends DateValue>(
  focusedDate: T,
  startDate: T,
  larger: boolean,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)

  if (!larger && !visibleDuration.days) {
    return adjust({
      focusedDate: focusedDate.subtract(getUnitDuration(visibleDuration)) as T,
      startDate,
    })
  }

  if (visibleDuration.days) {
    return getPreviousPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue)
  }

  if (visibleDuration.weeks) {
    return adjust({
      focusedDate: focusedDate.subtract({ months: 1 }) as T,
      startDate,
    })
  }

  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: focusedDate.subtract({ years: 1 }) as T,
      startDate,
    })
  }
}
