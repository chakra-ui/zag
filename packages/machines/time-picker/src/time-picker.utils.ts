import { Time } from "@internationalized/date"
import type { MachineContext, TimePeriod } from "./time-picker.types"

export function getNumberAsString(value: number) {
  if (value < 10) return `0${value}`
  return `${value}`
}

export function getStringifiedValue(ctx: MachineContext) {
  if (!ctx.value) return ""
  const hour = getNumberAsString(ctx.period === "pm" ? ctx.value.hour - 12 : ctx.value.hour)
  const minute = getNumberAsString(ctx.value.minute)
  const period = ctx.period ? ctx.period.toUpperCase() : ""
  if (ctx.withSeconds) {
    const second = getNumberAsString(ctx.value.second)
    return `${hour}:${minute}:${second} ${period}`
  }
  return `${hour}:${minute} ${period}`
}

export function getTimeValue(value: string): { time: Time; period: TimePeriod } | undefined {
  const match = value.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s?(AM|PM)?/)
  if (!match) return
  let [, hourString, minuteString, secondString, periodString] = match
  let hour = parseInt(hourString)
  const minute = parseInt(minuteString)
  const second = secondString ? parseInt(secondString) : undefined
  let period = (periodString ? periodString.toLowerCase() : "am") as TimePeriod
  if (hour > 12) {
    hour -= 12
    period = "pm"
  }
  return { time: new Time(hour, minute, second), period }
}

export function getPeriodHour(hour: number, period: TimePeriod) {
  return period === "pm" ? hour + 12 : hour
}

export function isValidCharacter(char: string | null) {
  if (!char) return true
  return /\d/.test(char) || char === ":" || char.length !== 1
}

export function ensureValidCharacters(value: string) {
  return value.split("").filter(isValidCharacter).join("")
}
