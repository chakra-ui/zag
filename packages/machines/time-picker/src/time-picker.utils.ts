import { Time } from "@internationalized/date"
import type { MachineContext } from "./time-picker.types"

export function getStringifiedValue(ctx: MachineContext) {
  const { hour, minute } = ctx.value
  const hourString = hour < 10 ? `0${hour}` : hour
  const minuteString = minute < 10 ? `0${minute}` : minute
  const period = ctx.period ? ctx.period.toUpperCase() : ""
  return `${hourString}:${minuteString} ${period}`
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

export function isValidCharacter(char: string | null) {
  if (!char) return true
  return /\d/.test(char) || char === ":" || char.length !== 1
}

export function ensureValidCharacters(value: string) {
  return value.split("").filter(isValidCharacter).join("")
}
