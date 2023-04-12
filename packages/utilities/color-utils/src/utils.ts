import { round } from "@zag-js/number-utils"

export function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

export function toFixedNumber(n: number, precision: number) {
  return Number(round(n, precision))
}

export function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
