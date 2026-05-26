import { DateFormatter, type AnyDateTime, type Calendar, CalendarDate, ZonedDateTime } from "@internationalized/date"
import type { DateValue } from "@internationalized/date"
import type { SegmentType } from "../date-input.types"

export type HourCycle = "h12" | "h11" | "h23" | "h24"

export function resolvedHourCycle(formatter: DateFormatter): HourCycle {
  const hc = formatter.resolvedOptions().hourCycle
  if (hc === "h11" || hc === "h12" || hc === "h23" || hc === "h24") return hc
  return "h23"
}

export function incompleteDateHash(dv: IncompleteDate): string {
  return `${dv.year}|${dv.month}|${dv.day}|${dv.hour}|${dv.dayPeriod}|${dv.minute}|${dv.second}|${dv.era}`
}

export function incompleteDateEqual(a: IncompleteDate, b: IncompleteDate): boolean {
  return incompleteDateHash(a) === incompleteDateHash(b)
}

export function initDisplayValues(
  value: DateValue[] | undefined,
  placeholderValue: DateValue,
  hourCycle: HourCycle,
  count: number,
): IncompleteDate[] {
  const calendar = placeholderValue.calendar
  if (value?.length) {
    return Array.from({ length: count }, (_, i) =>
      value[i] ? new IncompleteDate(calendar, hourCycle, value[i]) : new IncompleteDate(calendar, hourCycle),
    )
  }
  return Array.from({ length: count }, () => new IncompleteDate(calendar, hourCycle))
}

/**
 * Represents a date that is incomplete or otherwise invalid as a result of user editing.
 * Each field can be independently null (= placeholder / not yet entered by the user).
 * Ported from React Spectrum's IncompleteDate with minimal changes.
 */
export class IncompleteDate {
  calendar: Calendar
  era: string | null
  year: number | null
  month: number | null
  day: number | null
  hour: number | null
  hourCycle: HourCycle
  dayPeriod: number | null
  minute: number | null
  second: number | null
  millisecond: number | null
  offset: number | null

  constructor(calendar: Calendar, hourCycle: HourCycle, dateValue?: Partial<Omit<AnyDateTime, "copy">> | null) {
    this.era = dateValue?.era ?? null
    this.calendar = calendar
    this.year = dateValue?.year ?? null
    this.month = dateValue?.month ?? null
    this.day = dateValue?.day ?? null
    this.hour = dateValue?.hour ?? null
    this.hourCycle = hourCycle
    this.dayPeriod = null
    this.minute = dateValue?.minute ?? null
    this.second = dateValue?.second ?? null
    this.millisecond = dateValue?.millisecond ?? null
    this.offset = "offset" in (dateValue ?? {}) ? (dateValue as any).offset : null

    // Convert the hour from 24-hour time to the given hour cycle.
    if (this.hour != null) {
      const [dayPeriod, hour] = toHourCycle(this.hour, hourCycle)
      this.dayPeriod = dayPeriod
      this.hour = hour
    }
  }

  copy(): IncompleteDate {
    const res = new IncompleteDate(this.calendar, this.hourCycle)
    res.era = this.era
    res.year = this.year
    res.month = this.month
    res.day = this.day
    res.hour = this.hour
    res.dayPeriod = this.dayPeriod
    res.minute = this.minute
    res.second = this.second
    res.millisecond = this.millisecond
    res.offset = this.offset
    return res
  }

  /** Rebuild this date under a new hour cycle, preserving all field values. */
  withHourCycle(nextHourCycle: HourCycle): IncompleteDate {
    if (nextHourCycle === this.hourCycle) return this
    const hour24 = this.hour != null ? fromHourCycle(this.hour, this.dayPeriod ?? 0, this.hourCycle) : null
    const res = new IncompleteDate(this.calendar, nextHourCycle, {
      era: this.era,
      year: this.year,
      month: this.month,
      day: this.day,
      hour: hour24,
      minute: this.minute,
      second: this.second,
      millisecond: this.millisecond,
    } as Partial<Omit<AnyDateTime, "copy">>)
    res.offset = this.offset
    // Preserve a user-picked AM/PM that has no concrete hour yet (constructor drops it when hour is null).
    if (this.hour == null && this.dayPeriod != null && (nextHourCycle === "h12" || nextHourCycle === "h11")) {
      res.dayPeriod = this.dayPeriod
    }
    return res
  }

  /** Checks whether all the specified segments have a value. */
  isComplete(segments: SegmentType[]): boolean {
    return segments.every((segment) => (this as Record<string, unknown>)[segment] != null)
  }

  /** Checks if the date is empty (i.e. all specified segments are null). */
  isCleared(segments: SegmentType[]): boolean {
    return segments.every((segment) => (this as Record<string, unknown>)[segment] === null)
  }

  /** Sets the given field. */
  set(field: SegmentType, value: number | string, placeholder: DateValue): IncompleteDate {
    const result = this.copy()
    ;(result as any)[field] = value
    if (field === "hour" && result.dayPeriod == null && "hour" in placeholder) {
      result.dayPeriod = toHourCycle(placeholder.hour, this.hourCycle)[0]
    }
    if (field === "year" && result.era == null) {
      result.era = placeholder.era
    }

    // clear offset when a date/time field changes since it may no longer be valid
    if (field !== "second" && field !== "literal" && field !== "timeZoneName") {
      result.offset = null
    }
    return result
  }

  /** Sets the given field to null. */
  clear(field: SegmentType): IncompleteDate {
    const result = this.copy()
    // @ts-ignore
    result[field] = null
    if (field === "year") {
      result.era = null
    }

    // clear offset when a field is cleared since it may no longer be valid
    result.offset = null
    return result
  }

  /** Increments or decrements the given field. If it is null, then it is set to the placeholder value (no increment on first press). */
  cycle(field: SegmentType, amount: number, placeholder: DateValue, displaySegments: SegmentType[]): IncompleteDate {
    const res = this.copy()

    // If field is null, default to placeholder — return early without incrementing.
    if ((res as any)[field] == null && field !== "dayPeriod" && field !== "era") {
      if (field === "hour" && "hour" in placeholder) {
        const [dayPeriod, hour] = toHourCycle(placeholder.hour, this.hourCycle)
        res.dayPeriod = dayPeriod
        res.hour = hour
      } else {
        ;(res as any)[field] = placeholder[field as keyof typeof placeholder]
      }
      if (field === "year" && res.era == null) {
        res.era = placeholder.era
      }

      return res
    }

    switch (field) {
      case "era": {
        const eras = this.calendar.getEras()
        let index = eras.indexOf(res.era!)
        index = cycleValue(index, amount, 0, eras.length - 1)
        res.era = eras[index]
        break
      }
      case "year": {
        // Use CalendarDate to cycle so that we update the era when going between 1 AD and 1 BC.
        let date = new CalendarDate(
          this.calendar,
          this.era ?? placeholder.era,
          this.year ?? placeholder.year,
          this.month ?? 1,
          this.day ?? 1,
        )
        date = date.cycle(field, amount, { round: field === "year" })
        res.era = date.era
        res.year = date.year
        break
      }
      case "month":
        res.month = cycleValue(res.month ?? 1, amount, 1, this.calendar.getMaximumMonthsInYear())
        break
      case "day":
        // Allow incrementing up to the maximum number of days in any month.
        res.day = cycleValue(res.day ?? 1, amount, 1, this.calendar.getMaximumDaysInMonth())
        break
      case "hour": {
        // if date is fully defined or it is just a time field, and we have a time zone, use toValue to get a ZonedDateTime to cycle
        // so DST fallback is properly handled
        const hasDateSegments = displaySegments.some((s) => ["year", "month", "day"].includes(s))
        if (
          "timeZone" in placeholder &&
          (!hasDateSegments || (res.year != null && res.month != null && res.day != null))
        ) {
          let date = this.toValue(placeholder) as ZonedDateTime
          date = date.cycle("hour", amount, { hourCycle: this.hourCycle === "h12" ? 12 : 24, round: false })
          const [dayPeriod, adjustedHour] = toHourCycle(date.hour, this.hourCycle)
          res.hour = adjustedHour
          res.dayPeriod = dayPeriod
          res.offset = date.offset
        } else {
          const hours = res.hour ?? 0
          const limits = this.getSegmentLimits("hour")!
          res.hour = cycleValue(hours, amount, limits.minValue, limits.maxValue)
          if (res.dayPeriod == null && "hour" in placeholder) {
            res.dayPeriod = toHourCycle(placeholder.hour, this.hourCycle)[0]
          }
        }
        break
      }
      case "dayPeriod":
        res.dayPeriod = cycleValue(res.dayPeriod ?? 0, amount, 0, 1)
        break
      case "minute":
        res.minute = cycleValue(res.minute ?? 0, amount, 0, 59, true)
        break
      case "second":
        res.second = cycleValue(res.second ?? 0, amount, 0, 59, true)
        break
    }

    return res
  }

  /** Converts the incomplete date to a full date value, using the provided value for any unset fields. */
  toValue(value: DateValue): DateValue {
    if ("hour" in value) {
      let hour = this.hour
      if (hour != null) {
        hour = fromHourCycle(hour, this.dayPeriod ?? 0, this.hourCycle)
      } else if (this.hourCycle === "h12" || this.hourCycle === "h11") {
        hour = this.dayPeriod === 1 ? 12 : 0
      }

      const res = value.set({
        era: this.era ?? value.era,
        year: this.year ?? value.year,
        month: this.month ?? value.month,
        day: this.day ?? value.day,
        hour: hour ?? value.hour,
        minute: this.minute ?? value.minute,
        second: this.second ?? value.second,
        millisecond: this.millisecond ?? value.millisecond,
      })

      if ("offset" in res && this.offset != null && (res as ZonedDateTime).offset !== this.offset) {
        return (res as ZonedDateTime).add({ milliseconds: (res as ZonedDateTime).offset - this.offset })
      }

      return res
    } else {
      return value.set({
        era: this.era ?? value.era,
        year: this.year ?? value.year,
        month: this.month ?? value.month,
        day: this.day ?? value.day,
      })
    }
  }

  getSegmentLimits(type: string): { value: number | null; minValue: number; maxValue: number } | undefined {
    switch (type) {
      case "era": {
        const eras = this.calendar.getEras()
        return {
          value: this.era != null ? eras.indexOf(this.era) : eras.length - 1,
          minValue: 0,
          maxValue: eras.length - 1,
        }
      }
      case "year":
        return {
          value: this.year,
          minValue: 1,
          maxValue: 9999,
        }
      case "month":
        return {
          value: this.month,
          minValue: 1,
          maxValue: this.calendar.getMaximumMonthsInYear(),
        }
      case "day":
        return {
          value: this.day,
          minValue: 1,
          maxValue: this.calendar.getMaximumDaysInMonth(),
        }
      case "dayPeriod":
        return {
          value: this.dayPeriod,
          minValue: 0,
          maxValue: 1,
        }
      case "hour": {
        let minValue = 0
        let maxValue = 23
        if (this.hourCycle === "h12") {
          minValue = 1
          maxValue = 12
        } else if (this.hourCycle === "h11") {
          minValue = 0
          maxValue = 11
        }
        return {
          value: this.hour,
          minValue,
          maxValue,
        }
      }
      case "minute":
        return {
          value: this.minute,
          minValue: 0,
          maxValue: 59,
        }
      case "second":
        return {
          value: this.second,
          minValue: 0,
          maxValue: 59,
        }
    }
  }

  /** Returns a debug string of all non-null fields. Returns "-" when all fields are null. */
  toString(): string {
    const fields: Record<string, unknown> = {
      era: this.era,
      year: this.year,
      month: this.month,
      day: this.day,
      hour: this.hour,
      dayPeriod: this.dayPeriod,
      minute: this.minute,
      second: this.second,
    }
    const parts = Object.entries(fields)
      .filter(([, v]) => v != null)
      .map(([k, v]) => `${k}=${v}`)
    return parts.length > 0 ? parts.join(",") : "-"
  }
}

function cycleValue(value: number, amount: number, min: number, max: number, round = false) {
  if (round) {
    value += Math.sign(amount)

    if (value < min) {
      value = max
    }

    const div = Math.abs(amount)
    if (amount > 0) {
      value = Math.ceil(value / div) * div
    } else {
      value = Math.floor(value / div) * div
    }

    if (value > max) {
      value = min
    }
  } else {
    value += amount
    if (value < min) {
      value = max - (min - value - 1)
    } else if (value > max) {
      value = min + (value - max - 1)
    }
  }

  return value
}

export function toHourCycle(hour: number, hourCycle: HourCycle): [number | null, number] {
  let dayPeriod: number | null = hour >= 12 ? 1 : 0
  switch (hourCycle) {
    case "h11":
      // Hours are numbered from 0 to 11. Used in Japan.
      if (hour >= 12) {
        hour -= 12
      }
      break
    case "h12":
      // Hours are numbered from 12 (representing 0) to 11.
      if (hour === 0) {
        hour = 12
      } else if (hour > 12) {
        hour -= 12
      }
      break
    case "h23":
      // 24 hour time, numbered 0 to 23.
      dayPeriod = null
      break
    case "h24":
      // 24 hour time numbered 24 to 23. Unused but supported by Intl.DateTimeFormat.
      hour += 1
      dayPeriod = null
  }

  return [dayPeriod, hour]
}

function fromHourCycle(hour: number, dayPeriod: number, hourCycle: HourCycle): number {
  switch (hourCycle) {
    case "h11":
      if (dayPeriod === 1) {
        hour += 12
      }
      break
    case "h12":
      if (hour === 12) {
        hour = 0
      }
      if (dayPeriod === 1) {
        hour += 12
      }
      break
    case "h24":
      hour -= 1
      break
  }

  return hour
}
