import { toCalendarDateTime, type DateValue } from "@internationalized/date"
import type { Segments, SegmentType } from "../date-field.types"

export function addSegment(
  value: DateValue,
  type: SegmentType,
  amount: number,
  options: Intl.ResolvedDateTimeFormatOptions,
) {
  switch (type) {
    case "era":
    case "year":
    case "month":
    case "day":
      return value.cycle(type, amount, { round: type === "year" })
  }

  // dayPeriod, hour, minute, second require a value with time
  const valueWithTime = "hour" in value ? value : toCalendarDateTime(value)
  switch (type) {
    case "dayPeriod": {
      let hours = valueWithTime.hour
      let isPM = hours >= 12
      return valueWithTime.set({ hour: isPM ? hours - 12 : hours + 12 })
    }
    case "hour":
    case "minute":
    case "second":
      return valueWithTime.cycle(type, amount, {
        round: type !== "hour",
        hourCycle: options.hour12 ? 12 : 24,
      })
  }

  throw new Error("Unknown segment: " + type)
}

export function setSegment(
  value: DateValue,
  part: string,
  segmentValue: number | string,
  options: Intl.ResolvedDateTimeFormatOptions,
) {
  switch (part) {
    case "day":
    case "month":
    case "year":
    case "era":
      return value.set({ [part]: segmentValue })
  }

  // hour, minute, second, dayPeriod require a value with time
  const valueWithTime = "hour" in value ? value : toCalendarDateTime(value)
  const numValue = typeof segmentValue === "number" ? segmentValue : Number(segmentValue)
  if (!Number.isNaN(numValue)) {
    switch (part) {
      case "dayPeriod": {
        let hours = valueWithTime.hour
        let wasPM = hours >= 12
        let isPM = numValue >= 12
        if (isPM === wasPM) {
          return valueWithTime
        }
        return valueWithTime.set({ hour: wasPM ? hours - 12 : hours + 12 })
      }
      case "hour": {
        let hourValue = numValue
        // In 12 hour time, ensure that AM/PM does not change
        if (options.hour12) {
          let hours = valueWithTime.hour
          let wasPM = hours >= 12
          if (!wasPM && hourValue === 12) {
            hourValue = 0
          }
          if (wasPM && hourValue < 12) {
            hourValue += 12
          }
        }
        return valueWithTime.set({ hour: hourValue })
      }
      case "minute":
      case "second":
        return valueWithTime.set({ [part]: numValue })
    }
  }

  throw new Error("Unknown segment: " + part)
}

export function getDefaultValidSegments(value: DateValue[] | undefined, allSegments: Segments) {
  return value?.length ? value.map((date) => (date ? { ...allSegments } : {})) : [{}]
}
