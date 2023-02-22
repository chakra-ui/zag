import type { DateValue } from "@internationalized/date"
import type { DateFormatOptions, DateSegmentPart } from "./types"

export function addSegment(
  date: DateValue,
  part: DateSegmentPart,
  amount: number,
  options?: Pick<DateFormatOptions, "hour12">,
) {
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
          hourCycle: options?.hour12 ? 12 : 24,
        })
    }
  }

  return date
}

export function setSegment(
  date: DateValue,
  part: DateSegmentPart,
  value: number,
  options?: Pick<DateFormatOptions, "hour12">,
) {
  switch (part) {
    case "day":
    case "month":
    case "year":
    case "era":
      return date.set({ [part]: value })
  }

  if ("hour" in date) {
    switch (part) {
      case "dayPeriod": {
        let hours = date.hour
        let wasPM = hours >= 12
        let isPM = value >= 12
        return isPM === wasPM ? date : date.set({ hour: wasPM ? hours - 12 : hours + 12 })
      }

      case "hour":
        // In 12 hour time, ensure that AM/PM does not change
        if (options?.hour12) {
          let hours = date.hour
          let wasPM = hours >= 12

          if (!wasPM && value === 12) {
            value = 0
          }

          if (wasPM && value < 12) {
            value += 12
          }
        }

      // fallthrough
      case "minute":
      case "second":
        return date.set({ [part]: value })
    }
  }

  return date
}
