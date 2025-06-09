import type { Time } from "@internationalized/date"
import { getHourFormat } from "./hour-format"

export function isValidTime(h: number, m: number, s: number): boolean {
  return h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59
}

export function isTimeEqual(a: Time | null, b: Time | null | undefined): boolean {
  if (!a || !b) return false
  return a.hour === b.hour && a.minute === b.minute && a.second === b.second
}

export function isInRange(value: number, min: number | undefined, max: number | undefined): boolean {
  if (min == null || max == null) return true
  return !(value < min || value > max)
}

export function isValidCharacter(char: string | null): boolean {
  if (!char) return true
  return /\d/.test(char) || char === ":" || char.length !== 1
}

export function filterValidCharacter(value: string): string {
  return value.split("").filter(isValidCharacter).join("")
}

export function getPlaceholder(withSeconds: boolean | undefined, locale: string) {
  const format = getHourFormat(locale)
  const secondsPart = withSeconds ? ":--" : ""
  const periodPart = format.is12Hour ? " --" : ""
  return `--:--${secondsPart}${periodPart}`
}
