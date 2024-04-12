import { Time } from "@internationalized/date"
import type { MachineContext } from "./time-picker.types"

export function getNumberAsString(value: number) {
  if (value < 10) return `0${value}`
  return `${value}`
}

export function getStringifiedValue(ctx: MachineContext) {
  if (!ctx.value) return ""
  const hour = getNumberAsString(ctx.value.hour)
  const minute = getNumberAsString(ctx.value.minute)
  const period = ctx.period ? ctx.period.toUpperCase() : ""
  return `${hour}:${minute} ${period}`
}

export function getTimeValue(value: string): { time: Time; period: "am" | "pm" } | undefined {
  const match = value.match(/(\d{2}):(\d{2})\s?(AM|PM)?/)
  if (!match) return
  let [, hourString, minuteString, periodString] = match
  let hour = parseInt(hourString)
  const minute = parseInt(minuteString)
  let period = (periodString ? periodString.toLowerCase() : "am") as "am" | "pm"
  if (hour > 12) {
    hour -= 12
    period = "pm"
  }
  return { time: new Time(hour, minute), period }
}

export function createConditions<T extends (value: number) => boolean>(...filters: Array<T | unknown>) {
  const a = filters.filter((f): f is T => typeof f === "function")
  return (value: number) => a.every((f) => f(value))
}

export function isValidCharacter(char: string | null) {
  if (!char) return true
  return /\d/.test(char) || char === ":" || char.length !== 1
}

export function ensureValidCharacters(value: string) {
  return value.split("").filter(isValidCharacter).join("")
}
