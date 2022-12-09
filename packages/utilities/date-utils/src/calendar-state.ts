import {
  Calendar,
  CalendarDate,
  DateValue,
  endOfMonth,
  endOfWeek,
  getWeeksInMonth,
  GregorianCalendar,
  isSameDay,
  isToday,
  startOfMonth,
  startOfWeek,
  toCalendar,
  toCalendarDate,
  today,
} from "@internationalized/date"
import { alignCenter, alignEnd, alignStart, constrainStart, constrainValue } from "./align-date"
import { getDatesInWeek } from "./get-dates-in-weeks"
import { DateContext } from "./types"

export function getCalendarState(ctx: DateContext) {
  return {
    isInvalid(date: DateValue) {
      return (ctx.min != null && date.compare(ctx.min) < 0) || (ctx.max != null && date.compare(ctx.max) > 0)
    },

    isDisabled(date: CalendarDate, startDate: CalendarDate, endDate: CalendarDate) {
      return date.compare(startDate) < 0 || date.compare(endDate) > 0 || this.isInvalid(date)
    },

    isUnavailable(date: CalendarDate) {
      if (!date) return false

      if (ctx.isDateUnavailable?.(date)) {
        return true
      }

      return this.isInvalid(date)
    },

    isToday(date: CalendarDate) {
      return isToday(date, ctx.timeZone)
    },

    isOutsideVisibleRange(date: CalendarDate, startDate: CalendarDate, endDate: CalendarDate) {
      return date.compare(startDate) < 0 || date.compare(endDate) > 0
    },

    isEqual(dateA: CalendarDate, dateB: CalendarDate | null | undefined) {
      return dateB != null && isSameDay(dateA, dateB)
    },

    isPreviousVisibleRangeInvalid(startDate: CalendarDate) {
      let prev = startDate.subtract({ days: 1 })
      return isSameDay(prev, startDate) || this.isInvalid(prev)
    },

    isNextVisibleRangeInvalid(endDate: CalendarDate) {
      let next = endDate.add({ days: 1 })
      return isSameDay(next, endDate) || this.isInvalid(next)
    },

    clamp(date: CalendarDate) {
      return constrainValue(date, ctx)
    },

    getToday() {
      return today(ctx.timeZone)
    },

    getUnitDuration() {
      let d = { ...ctx.duration }
      for (let key in d) d[key] = 1
      return d
    },

    getAdjustedStartDate(focusedDate: CalendarDate, startDate: CalendarDate, endDate: CalendarDate) {
      if (focusedDate.compare(startDate) < 0) {
        return alignEnd(focusedDate, ctx)
      }

      if (focusedDate.compare(endDate) > 0) {
        return alignStart(focusedDate, ctx)
      }

      return startDate
    },

    getEndDate(startDate: CalendarDate) {
      let d = { ...ctx.duration }
      if (d.days) {
        d.days--
      } else {
        d.days = -1
      }
      return startDate.add(d)
    },

    getPreviousAvailableDate(date: CalendarDate, min?: CalendarDate) {
      const minValue = min ?? ctx.min
      if (!this.isUnavailable(date) || !minValue) {
        return date
      }

      while (date.compare(minValue) >= 0 && this.isUnavailable(date)) {
        date = date.subtract({ days: 1 })
      }

      if (date.compare(minValue) >= 0) {
        return date
      }
    },

    getNextDay(date: CalendarDate) {
      return date.add({ days: 1 })
    },

    getPreviousDay(date: CalendarDate) {
      return date.subtract({ days: 1 })
    },

    getNextPage(date: CalendarDate, startDate: CalendarDate) {
      let start = startDate.add(ctx.duration)
      return {
        start: alignStart(constrainStart(date, start, ctx), ctx),
        focused: constrainValue(date.add(ctx.duration), ctx),
      }
    },

    getPreviousPage(date: CalendarDate, startDate: CalendarDate) {
      let start = startDate.subtract(ctx.duration)
      return {
        focused: constrainValue(date.subtract(ctx.duration), ctx),
        start: alignStart(constrainStart(date, start, ctx), ctx),
      }
    },

    getSectionStart(date: CalendarDate, startDate: CalendarDate) {
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
    },

    getSectionEnd(date: CalendarDate, endDate: CalendarDate) {
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
    },

    getNextRow(date: CalendarDate, startDate: CalendarDate) {
      const d = ctx.duration

      if (d.days) {
        return this.getNextPage(date, startDate)
      }

      if (d.weeks || d.months || d.years) {
        return date.add({ weeks: 1 })
      }
    },

    getPreviousRow(date: CalendarDate, startDate: CalendarDate) {
      const d = ctx.duration

      if (d.days) {
        return this.getPreviousPage(date, startDate)
      }

      if (d.weeks || d.months || d.years) {
        return date.subtract({ weeks: 1 })
      }
    },

    getWeekDays() {
      let weekStart = startOfWeek(today(ctx.timeZone), ctx.locale)
      return [...new Array(7).keys()].map((index) => {
        let date = weekStart.add({ days: index })
        return date.toDate(ctx.timeZone)
      })
    },

    getMonthDates(startDate: CalendarDate) {
      const weeksInMonth = getWeeksInMonth(startDate, ctx.locale)
      const computedWeek = ctx.duration.weeks ?? weeksInMonth
      return [...new Array(computedWeek).keys()].map((index) => getDatesInWeek(index, startDate, ctx.locale))
    },

    getNextSection(date: CalendarDate, larger?: boolean) {
      const d = ctx.duration
      const unitDuration = this.getUnitDuration()

      if (!larger && !d.days) {
        return date.add(unitDuration)
      }

      if (d.days) {
        return date.add(d)
      } else if (d.weeks) {
        return date.add({ months: 1 })
      } else if (d.months || d.years) {
        return date.add({ years: 1 })
      }
    },

    getPreviousSection(date: CalendarDate, larger?: boolean) {
      const d = ctx.duration
      const unitDuration = this.getUnitDuration()

      if (!larger && !d.days) {
        return date.subtract(unitDuration)
      }

      if (d.days) {
        return date.subtract(ctx.duration)
      } else if (d.weeks) {
        return date.subtract({ months: 1 })
      } else if (d.months || d.years) {
        return date.subtract({ years: 1 })
      }
    },

    setMonth(date: CalendarDate, month: number) {
      return date.set({ month })
    },

    setYear(date: CalendarDate, year: number) {
      return date.set({ year })
    },

    setCalendar(date: CalendarDate, calendar: Calendar) {
      return toCalendar(toCalendarDate(date), calendar)
    },

    setAlignment(date: CalendarDate, alignment: "start" | "end" | "center") {
      switch (alignment) {
        case "start":
          return alignStart(date, ctx)
        case "end":
          return alignEnd(date, ctx)
        case "center":
        default:
          return alignCenter(date, ctx)
      }
    },

    setDate(current: CalendarDate, newDate: CalendarDate, startDate: CalendarDate) {
      let result: CalendarDate | undefined
      result = this.clamp(newDate)
      result = this.getPreviousAvailableDate(newDate, startDate)

      if (!result) return
      result = toCalendar(result, current?.calendar || new GregorianCalendar())

      if (current && "hour" in current) {
        return current.set(result)
      }

      return result
    },
  }
}
