import type { DateValue } from "@internationalized/date"
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

  if ("hour" in value) {
    switch (type) {
      case "dayPeriod": {
        let hours = value.hour
        let isPM = hours >= 12
        return value.set({ hour: isPM ? hours - 12 : hours + 12 })
      }
      case "hour":
      case "minute":
      case "second":
        return value.cycle(type, amount, {
          round: type !== "hour",
          hourCycle: options.hour12 ? 12 : 24,
        })
    }
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

  if ("hour" in value && typeof segmentValue === "number") {
    switch (part) {
      case "dayPeriod": {
        let hours = value.hour
        let wasPM = hours >= 12
        let isPM = segmentValue >= 12
        if (isPM === wasPM) {
          return value
        }
        return value.set({ hour: wasPM ? hours - 12 : hours + 12 })
      }
      case "hour":
        // In 12 hour time, ensure that AM/PM does not change
        if (options.hour12) {
          let hours = value.hour
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
        return value.set({ [part]: segmentValue })
    }
  }

  throw new Error("Unknown segment: " + part)
}

export function getDefaultValidSegments(value: DateValue[] | undefined, allSegments: Segments) {
  return value?.length ? value.map((date) => (date ? { ...allSegments } : {})) : [{}]
}
