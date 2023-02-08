import { DateValue, getMinimumDayInMonth, getMinimumMonthInYear } from "@internationalized/date"
import { DateFormatOptions, DateSegmentPart } from "./types"

export function getSegmentLimits(date: DateValue, type: DateSegmentPart, options?: Pick<DateFormatOptions, "hour12">) {
  switch (type) {
    case "era": {
      let eras = date.calendar.getEras()
      return {
        value: eras.indexOf(date.era),
        min: 0,
        max: eras.length - 1,
      }
    }
    case "year":
      return {
        value: date.year,
        min: 1,
        max: date.calendar.getYearsInEra(date),
      }
    case "month":
      return {
        value: date.month,
        min: getMinimumMonthInYear(date),
        max: date.calendar.getMonthsInYear(date),
      }
    case "day":
      return {
        value: date.day,
        min: getMinimumDayInMonth(date),
        max: date.calendar.getDaysInMonth(date),
      }
  }

  if ("hour" in date) {
    switch (type) {
      case "dayPeriod":
        return {
          value: date.hour >= 12 ? 12 : 0,
          min: 0,
          max: 12,
        }
      case "hour":
        if (options?.hour12) {
          let isPM = date.hour >= 12
          return {
            value: date.hour,
            min: isPM ? 12 : 0,
            max: isPM ? 23 : 11,
          }
        }

        return {
          value: date.hour,
          min: 0,
          max: 23,
        }
      case "minute":
        return {
          value: date.minute,
          min: 0,
          max: 59,
        }
      case "second":
        return {
          value: date.second,
          min: 0,
          max: 59,
        }
    }
  }

  return {
    value: -1,
    min: -1,
    max: -1,
  }
}
