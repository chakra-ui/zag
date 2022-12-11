import { DateValue, getMinimumDayInMonth, getMinimumMonthInYear, now } from "@internationalized/date"
import { DateSegmentContext } from "./types"

const EDITABLE_SEGMENTS = {
  year: true,
  month: true,
  day: true,
  hour: true,
  minute: true,
  second: true,
  dayPeriod: true,
  era: true,
}

const PAGE_STEP = {
  year: 5,
  month: 2,
  day: 7,
  hour: 2,
  minute: 15,
  second: 15,
}

type Part = Intl.DateTimeFormatPartTypes

export function getSegmentState(ctx: DateSegmentContext) {
  return {
    getGranularity(date: DateValue | undefined) {
      return date && "minute" in date ? "minute" : "day"
    },
    getPlaceholderDate() {
      return now(ctx.timeZone).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
    },
    getValidSegments() {
      const formatter = ctx.getDateFormatter({})
      return formatter
        .formatToParts(new Date())
        .filter((segment) => EDITABLE_SEGMENTS[segment.type])
        .reduce((acc, segment) => ((acc[segment.type] = true), acc), {})
    },
    getSegments(dateValue: DateValue | undefined) {
      const date = dateValue || this.getPlaceholderDate()
      const nativeDate = date.toDate(ctx.timeZone)
      const dateFormatter = ctx.getDateFormatter({})
      const validSegments = this.getValidSegments()

      return dateFormatter.formatToParts(nativeDate).map((segment) => {
        let isEditable = EDITABLE_SEGMENTS[segment.type]

        if (segment.type === "era") {
          isEditable = false
        }

        let isPlaceholder = EDITABLE_SEGMENTS[segment.type] && !validSegments[segment.type]

        let placeholder = EDITABLE_SEGMENTS[segment.type]
          ? ctx.getPlaceholder({ field: segment.type, locale: ctx.locale })
          : null

        return {
          type: segment.type,
          text: isPlaceholder ? placeholder : segment.value,
          ...getSegmentLimits(date, segment.type, dateFormatter.resolvedOptions()),
          isPlaceholder,
          placeholder,
          isEditable,
        }
      })
    },
    setSegment,
    adjustSegment(date: DateValue, part: Part, amount: number) {
      const dateFormatter = ctx.getDateFormatter({})
      addSegment(date, part, amount, dateFormatter.resolvedOptions())
    },
    increment(date: DateValue, part: Part) {
      return this.adjustSegment(date, part, 1)
    },
    decrement(date: DateValue, part: Part) {
      return this.adjustSegment(date, part, -1)
    },
    incrementPage(date: DateValue, part: Part) {
      return this.adjustSegment(date, part, PAGE_STEP[part] || 1)
    },
    decrementPage(date: DateValue, part: Part) {
      return this.adjustSegment(date, part, -(PAGE_STEP[part] || 1))
    },
  }
}

function addSegment(date: DateValue, part: string, amount: number, options: Intl.ResolvedDateTimeFormatOptions) {
  switch (part) {
    case "era":
    case "year":
    case "month":
    case "day":
      return date.cycle(part, amount, { round: part === "year" })
  }

  if ("hour" in date) {
    switch (part) {
      case "dayPeriod": {
        let hours = date.hour
        let isPM = hours >= 12
        return date.set({ hour: isPM ? hours - 12 : hours + 12 })
      }
      case "hour":
      case "minute":
      case "second":
        return date.cycle(part, amount, {
          round: part !== "hour",
          hourCycle: options.hour12 ? 12 : 24,
        })
    }
  }
}

function getSegmentLimits(date: DateValue, type: string, options: Intl.ResolvedDateTimeFormatOptions) {
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
        if (options.hour12) {
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

  return {}
}

function setSegment(date: DateValue, part: string, segmentValue: number, options: Intl.ResolvedDateTimeFormatOptions) {
  switch (part) {
    case "day":
    case "month":
    case "year":
    case "era":
      return date.set({ [part]: segmentValue })
  }

  if ("hour" in date) {
    switch (part) {
      case "dayPeriod": {
        let hours = date.hour
        let wasPM = hours >= 12
        let isPM = segmentValue >= 12
        if (isPM === wasPM) {
          return date
        }
        return date.set({ hour: wasPM ? hours - 12 : hours + 12 })
      }
      case "hour":
        // In 12 hour time, ensure that AM/PM does not change
        if (options.hour12) {
          let hours = date.hour
          let wasPM = hours >= 12
          if (!wasPM && segmentValue === 12) {
            segmentValue = 0
          }
          if (wasPM && segmentValue < 12) {
            segmentValue += 12
          }
        }
      // fallthrough
      case "minute":
      case "second":
        return date.set({ [part]: segmentValue })
    }
  }
}

// function createPlaceholderDate(granularity: string, calendar: Calendar, timeZone: string) {
//   if (granularity === "year" || granularity === "month" || granularity === "day") {
//     return toCalendarDate(date)
//   }

//   if (!timeZone) {
//     return toCalendarDateTime(date)
//   }

//   return date
// }
