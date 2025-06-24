import { Time } from "@internationalized/date"

interface TimeSegment {
  hour: number
  minute: number
  second: number
  millisecond: number
}

export function parse(value: Partial<TimeSegment>): Time {
  return new Time(value.hour, value.minute, value.second, value.millisecond)
}
