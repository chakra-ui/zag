import { Time } from "@internationalized/date"
import type { TimePeriod } from "./time-picker.types"

export function getCurrentTime() {
  const now = new Date()
  return new Time(now.getHours(), now.getMinutes(), now.getSeconds())
}

export function padTime(value: number) {
  return value < 10 ? `0${value}` : `${value}`
}

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

  let result = `${padTime(hourValue)}:${padTime(value.minute)}`

  if (allowSeconds) {
    const second = padTime(value.second)
    result += `:${second}`
  }

  if (hour12 && period) {
    result += ` ${period.toUpperCase()}`
  }

  return result
}

/////////////////////////////////////////////////////////////////////////

const TIME_REX = /(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s?(AM|PM|am|pm)?/

export function parseTime(value: string) {
  const match = value.match(TIME_REX)
  if (!match) return

  let [, hourString, minuteString, secondString, periodString] = match

  let hour = parseInt(hourString)
  const minute = parseInt(minuteString)
  const second = secondString ? parseInt(secondString) : 0

  let period = (periodString ? periodString.toLowerCase() : "am") as TimePeriod
  if (period === "pm" || (period === "am" && hour > 11)) {
    hour += 12
  }

  return new Time(hour, minute, second)
}

/////////////////////////////////////////////////////////////////////////

interface TimeRangeOptions {
  from: string
  to: string
  interval: string
}

export function getTimeRange(options: TimeRangeOptions) {
  const { from, to, interval } = options

  let fromTime = parseTime(from)
  const toTime = parseTime(to)
  const intervalTime = parseTime(interval)

  const range: Time[] = []
  if (!fromTime || !toTime || !intervalTime) return range

  while (fromTime.compare(toTime) <= 0) {
    range.push(fromTime.copy())
    fromTime = fromTime.add({ hours: intervalTime.hour, minutes: intervalTime.minute, seconds: intervalTime.second })
  }
  return range
}

/////////////////////////////////////////////////////////////////////////

export function getTimeValue(value: string, locale: string, periodProp: TimePeriod | null) {
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
