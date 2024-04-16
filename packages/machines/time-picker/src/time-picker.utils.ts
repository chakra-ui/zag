import { Time } from "@internationalized/date"
import type { MachineContext, TimePeriod } from "./time-picker.types"

export function getNumberAsString(value: number) {
  if (value < 10) return `0${value}`
  return `${value}`
}

export function getStringifiedValue(ctx: MachineContext) {
  if (!ctx.value) return ""

  const is12Hour = is12HourFormat(ctx.locale)
  const hour = getNumberAsString(is12Hour && ctx.period === "pm" ? ctx.value.hour - 12 : ctx.value.hour)
  const minute = getNumberAsString(ctx.value.minute)

  let result = `${hour}:${minute}`

  if (ctx.withSeconds) {
    const second = getNumberAsString(ctx.value.second)
    result += `:${second}`
  }

  if (is12Hour) {
    result += ` ${ctx.period.toUpperCase()}`
  }

  return result
}

export function getTimeValue(value: string, ctx: MachineContext): { time: Time; period: TimePeriod } | undefined {
  const match = value.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s?(AM|PM|am|pm)?/)
  if (!match) return
  let [, hourString, minuteString, secondString, periodString] = match

  let hour = parseInt(hourString)
  const minute = parseInt(minuteString)
  const second = secondString ? parseInt(secondString) : undefined

  if (!is12HourFormat(ctx.locale)) {
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

export function get12HourFormatPeriodHour(hour: number, period: TimePeriod) {
  return period === "pm" ? hour + 12 : hour
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
