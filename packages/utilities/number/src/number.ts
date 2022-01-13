import { formatter, nf } from "./number-format"

export type Num<T extends string> = Record<T, number>

export function wrap(num: number, max: number): number {
  return ((num % max) + max) % max
}

export function round(v: number | string, t?: number) {
  let num = valueOf(v)
  const p = 10 ** (t ?? 10)
  num = Math.round(num * p) / p
  return t ? num.toFixed(t) : v.toString()
}

export function roundToPx(num: number) {
  if (typeof window === "undefined") return Math.round(num)
  const dp = window.devicePixelRatio
  return Math.floor(num * dp + 0.5) / dp
}

export const valueToPercent = (v: number | string, r: Num<"step" | "min" | "max">) =>
  ((valueOf(v) - r.min) * 100) / (r.max - r.min)

export const percentToValue = (v: number | string, r: Num<"min" | "max">) => r.min + (r.max - r.min) * valueOf(v)

export function clamp(v: number | string, o: Num<"min" | "max">) {
  return Math.min(Math.max(valueOf(v), o.min), o.max)
}

export function countDecimals(v: number | undefined) {
  return nf.formatToParts(v).find((p) => p.type === "fraction")?.value.length ?? 0
}

export const increment = (v: number | string, s: number) => formatter(valueOf(v) + s)

export const decrement = (v: number | string, s: number) => formatter(valueOf(v) - s)

export const multiply = (v: number | string, s: number) => formatter(valueOf(v) * s)

export function snapToStep(value: number | string, step: number) {
  const num = valueOf(value)
  const p = countDecimals(step)
  const v = Math.round(num / step) * step
  return round(v, p)
}

export function valueOf(v: string | number) {
  if (typeof v === "number") return v
  const num = parseFloat(v.toString().replace(/[^\w.-]+/g, ""))
  return !Number.isNaN(num) ? num : 0
}

type PrecisionOptions = {
  value: string | number
  precision?: number
  step: number
}

export function getMaxPrecision(o: PrecisionOptions) {
  const stepPrecision = countDecimals(o.step)
  const val = valueOf(o.value)
  const valuePrecision = Number.isNaN(val) ? stepPrecision : Math.max(countDecimals(val), stepPrecision)
  return Math.max(valuePrecision, o.precision ?? 0)
}

export function roundToPrecision(v: number | string, o: Omit<PrecisionOptions, "value">) {
  return round(v, getMaxPrecision({ ...o, value: v }))
}

export function isAtMax(v: number | string, o: Num<"max">) {
  const val = valueOf(v)
  return val >= o.max
}

export function isAtMin(v: number | string, o: Num<"min">) {
  const val = valueOf(v)
  return val <= o.min
}

export function isWithinRange(v: number | string, o: Num<"min" | "max">) {
  const val = valueOf(v)
  return val >= o.min && val <= o.max
}
