import { isObject } from "@zag-js/utils"
import type { TimePart, Time } from "./timer.types"

const segments = new Set<TimePart>(["days", "hours", "minutes", "seconds"])

function isTimeSegment(date: any): date is Time {
  return isObject(date) && Object.keys(date).some((key) => segments.has(key as any))
}

export function parse(date: string | Partial<Time>): number {
  if (typeof date === "string") {
    return new Date(date).getTime()
  }

  if (isTimeSegment(date)) {
    const { days = 0, hours = 0, minutes = 0, seconds = 0, milliseconds = 0 } = date
    const value = (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds) * 1000
    return value + milliseconds
  }

  throw new Error("Invalid date")
}
