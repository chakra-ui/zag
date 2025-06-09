import { Time } from "@internationalized/date"
import { nan } from "@zag-js/utils"
import { isValidTime } from "./assertion"
import { getHourFormat } from "./hour-format"

export function padTime(value: number) {
  return value < 10 ? `0${value}` : `${value}`
}

export function valueToCell(value: number) {
  return { label: padTime(value), value }
}

export function timeToString(t: Time | null, locale: string, withSeconds = false): string {
  if (!t) return ""
  const format = getHourFormat(locale)
  const hour = format.is12Hour ? format.to12Hour(t.hour) : t.hour
  let result = `${padTime(hour)}:${padTime(t.minute)}`
  if (withSeconds) {
    result += `:${padTime(t.second)}`
  }
  if (format.is12Hour) {
    result += t.hour >= 12 ? " PM" : " AM"
  }
  return result
}

export function stringToTime(s: string, locale: string): Time | null {
  const [hour, minute = 0, second = 0] = s.split(":").map((part) => nan(Number(part.trim())))
  if (!isValidTime(hour, minute, second)) return null

  const format = getHourFormat(locale)
  const hour12 = format.is12Hour ? format.to12Hour(hour) : hour
  return new Time(hour12, minute, second)
}

export function clampTime(t: Time, min?: Time, max?: Time): Time {
  let result = t
  if (min && min.compare(t) > 0) result = min
  if (max && max.compare(t) < 0) result = max
  return result.copy()
}
