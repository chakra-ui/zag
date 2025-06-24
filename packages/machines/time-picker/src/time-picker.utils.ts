import { Time } from "@internationalized/date"
import type { TimePeriod } from "./time-picker.types"

export function getCurrentTime() {
  const now = new Date()
  return new Time(now.getHours(), now.getMinutes(), now.getSeconds())
}

export const padStart = (value: number) => value.toString().padStart(2, "0")

export function getValueString(
  value: Time | null,
  hour12: boolean,
  period: TimePeriod | null,
  allowSeconds: boolean | undefined,
) {
  if (!value) return ""

  let hourValue = value.hour
  if (hour12 && hourValue === 0) {
    hourValue = 12
  } else if (hour12 && hourValue > 12) {
    hourValue -= 12
  }

  let result = `${padStart(hourValue)}:${padStart(value.minute)}`

  if (allowSeconds) {
    const second = padStart(value.second)
    result += `:${second}`
  }

  if (hour12 && period) {
    result += ` ${period.toUpperCase()}`
  }

  return result
}

const TIME_REX = /(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s?(AM|PM|am|pm)?/

export function getTimeValue(locale: string, periodProp: TimePeriod | null, value: string) {
  const match = value.match(TIME_REX)
  if (!match) return
  let [, hourString, minuteString, secondString, periodString] = match

  let hour = parseInt(hourString)
  const minute = parseInt(minuteString)
  const second = secondString ? parseInt(secondString) : undefined

  if (!is12HourFormat(locale) && periodProp) {
    return { time: new Time(hour, minute, second), period: periodProp }
  }

  let period = (periodString ? periodString.toLowerCase() : "am") as TimePeriod
  if (hour > 11) {
    period = "pm"
  } else if (period === "pm") {
    hour += 12
  }
  return { time: new Time(hour, minute, second), period }
}

export function get12HourFormatPeriodHour(hour: number, period: TimePeriod | null) {
  if (!period) return hour
  return period === "pm" ? hour + 12 : hour
}

export function getHourPeriod(hour: number | undefined, locale: string) {
  if (hour === undefined || !is12HourFormat(locale)) return null
  return hour > 11 ? "pm" : "am"
}

export function is12HourFormat(locale: string) {
  return new Intl.DateTimeFormat(locale, { hour: "numeric" })
    .formatToParts(new Date())
    .some((part) => part.type === "dayPeriod")
}

export function isValidCharacter(char: string | null) {
  if (!char) return true
  return /\d/.test(char) || char === ":" || char.length !== 1
}

export function ensureValidCharacters(value: string) {
  return value.split("").filter(isValidCharacter).join("")
}

export function getInputPlaceholder(
  placeholder: string | undefined,
  allowSeconds: boolean | undefined,
  locale: string,
) {
  if (placeholder) return placeholder
  const secondsPart = allowSeconds ? ":ss" : ""
  const periodPart = is12HourFormat(locale) ? " aa" : ""
  return `hh:mm${secondsPart}${periodPart}`
}

export function clampTime(value: Time, min: Time | undefined, max: Time | undefined) {
  let time = value
  if (min && min.compare(value) > 0) {
    time = min.copy()
  } else if (max && max.compare(value) < 0) {
    time = max.copy()
  }
  return time
}

export function isTimeEqual(a: Time | null, b: Time | undefined | null) {
  if (!a || !b) return false
  return a.hour === b.hour && a.minute === b.minute && a.second === b.second
}
