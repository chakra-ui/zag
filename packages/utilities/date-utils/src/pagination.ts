import {
  type DateDuration,
  type DateValue,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "@internationalized/date"
import { isDateInvalid } from "./assertion"
import { alignEnd, alignStart, constrainStart, constrainValue } from "./constrain"
import { getEndDate, getUnitDuration } from "./duration"

export interface AdjustDateParams {
  startDate: DateValue
  focusedDate: DateValue
}

export interface AdjustDateReturn extends AdjustDateParams {
  endDate: DateValue
}

export function getAdjustedDateFn(
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  return function getDate(options: AdjustDateParams): AdjustDateReturn {
    const { startDate, focusedDate } = options
    const endDate = getEndDate(startDate, visibleDuration)

    // If the focused date was moved to an invalid value, it can't be focused, so constrain it.
    if (isDateInvalid(focusedDate, minValue, maxValue)) {
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

export function getNextPage(
  focusedDate: DateValue,
  startDate: DateValue,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)
  const start = startDate.add(visibleDuration)

  return adjust({
    focusedDate: focusedDate.add(visibleDuration),
    startDate: alignStart(
      constrainStart(focusedDate, start, visibleDuration, locale, minValue, maxValue),
      visibleDuration,
      locale,
    ),
  })
}

export function getPreviousPage(
  focusedDate: DateValue,
  startDate: DateValue,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)
  let start = startDate.subtract(visibleDuration)

  return adjust({
    focusedDate: focusedDate.subtract(visibleDuration),
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

export function getNextRow(
  focusedDate: DateValue,
  startDate: DateValue,
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
      focusedDate: focusedDate.add({ weeks: 1 }),
      startDate,
    })
  }
}

export function getPreviousRow(
  focusedDate: DateValue,
  startDate: DateValue,
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
      focusedDate: focusedDate.subtract({ weeks: 1 }),
      startDate,
    })
  }
}

/* -----------------------------------------------------------------------------
 * Get start and end date for a date section
 * -----------------------------------------------------------------------------*/

export function getSectionStart(
  focusedDate: DateValue,
  startDate: DateValue,
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
      focusedDate: startOfWeek(focusedDate, locale),
      startDate,
    })
  }

  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: startOfMonth(focusedDate),
      startDate,
    })
  }
}

export function getSectionEnd(
  focusedDate: DateValue,
  startDate: DateValue,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)
  const endDate = getEndDate(startDate, visibleDuration)

  if (visibleDuration.days) {
    return adjust({
      focusedDate: endDate,
      startDate,
    })
  }

  if (visibleDuration.weeks) {
    return adjust({
      //@ts-expect-error - endOfWeek is loosely typed
      focusedDate: endOfWeek(focusedDate, locale),
      startDate,
    })
  }

  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: endOfMonth(focusedDate),
      startDate,
    })
  }
}

export function getNextSection(
  focusedDate: DateValue,
  startDate: DateValue,
  larger: boolean,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)

  if (!larger && !visibleDuration.days) {
    return adjust({
      focusedDate: focusedDate.add(getUnitDuration(visibleDuration)),
      startDate,
    })
  }

  if (visibleDuration.days) {
    return getNextPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue)
  }

  if (visibleDuration.weeks) {
    return adjust({
      focusedDate: focusedDate.add({ months: 1 }),
      startDate,
    })
  }

  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: focusedDate.add({ years: 1 }),
      startDate,
    })
  }
}

export function getPreviousSection(
  focusedDate: DateValue,
  startDate: DateValue,
  larger: boolean,
  visibleDuration: DateDuration,
  locale: string,
  minValue?: DateValue,
  maxValue?: DateValue,
) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue)

  if (!larger && !visibleDuration.days) {
    return adjust({
      focusedDate: focusedDate.subtract(getUnitDuration(visibleDuration)),
      startDate,
    })
  }

  if (visibleDuration.days) {
    return getPreviousPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue)
  }

  if (visibleDuration.weeks) {
    return adjust({
      focusedDate: focusedDate.subtract({ months: 1 }),
      startDate,
    })
  }

  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: focusedDate.subtract({ years: 1 }),
      startDate,
    })
  }
}
