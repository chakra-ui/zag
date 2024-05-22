import { isObject } from "@zag-js/utils"
import type { TimeSegments } from "./timer.types"

const segments = new Set(["day", "hour", "minute", "second"])
const isTimeSegment = (date: any): date is TimeSegments => {
  return isObject(date) && Object.keys(date).some((key) => segments.has(key))
}

export function parse(date: string | Partial<TimeSegments>): number {
  if (typeof date === "string") {
    return new Date(date).getTime()
  }

  if (isTimeSegment(date)) {
    const { day = 0, hour = 0, minute = 0, second = 0, millisecond = 0 } = date
    const value = (day * 24 * 60 * 60 + hour * 60 * 60 + minute * 60 + second) * 1000
    return value + millisecond
  }

  throw new Error("Invalid date")
}
