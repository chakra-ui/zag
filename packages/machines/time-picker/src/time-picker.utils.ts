import { Time } from "@internationalized/date"
import type { MachineContext, TimePeriod } from "./time-picker.types"

export function getCurrentTime() {
  const now = new Date()
  return new Time(now.getHours(), now.getMinutes(), now.getSeconds())
}

export const padStart = (value: number) => value.toString().padStart(2, "0")

export function getStringifiedValue(ctx: MachineContext) {
  if (!ctx.value) return ""

  let hourValue = ctx.value.hour
  if (ctx.hour12 && hourValue === 0) {
    hourValue = 12
  } else if (ctx.hour12 && hourValue > 12) {
    hourValue -= 12
  }

  let result = `${padStart(hourValue)}:${padStart(ctx.value.minute)}`

  if (ctx.allowSeconds) {
    const second = padStart(ctx.value.second)
    result += `:${second}`
  }

  if (ctx.hour12 && ctx.period) {
    result += ` ${ctx.period.toUpperCase()}`
  }

  return result
}

const TIME_REX = /(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s?(AM|PM|am|pm)?/

export function getTimeValue(ctx: MachineContext, value: string) {
  const match = value.match(TIME_REX)
  if (!match) return
  let [, hourString, minuteString, secondString, periodString] = match

  let hour = parseInt(hourString)
  const minute = parseInt(minuteString)
  const second = secondString ? parseInt(secondString) : undefined

  if (!is12HourFormat(ctx.locale) && ctx.period) {
    return { time: new Time(hour, minute, second), period: ctx.period }
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

export function getHourPeriod(hour: number | undefined) {
  if (hour === undefined) return null
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

export function getInputPlaceholder(ctx: MachineContext) {
  if (ctx.placeholder) return ctx.placeholder
  const secondsPart = ctx.allowSeconds ? ":ss" : ""
  const periodPart = is12HourFormat(ctx.locale) ? " aa" : ""
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
