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

export function roundToDevicePixel(num: number) {
  if (typeof window.devicePixelRatio !== "number") return Math.round(num)
  const dp = window.devicePixelRatio
  return Math.floor(num * dp + 0.5) / dp
}

export const valueToPercent = (v: number | string, r: Num<"step" | "min" | "max">) =>
  ((valueOf(v) - r.min) * 100) / (r.max - r.min)

export const percentToValue = (v: number | string, r: Num<"min" | "max">) => r.min + (r.max - r.min) * valueOf(v)

export function clamp(v: number | string, o: Num<"min" | "max">) {
  return Math.min(Math.max(valueOf(v), o.min), o.max)
}

export function countDecimals(value: number) {
  if (!Number.isFinite(value)) return 0
  let e = 1,
    p = 0
  while (Math.round(value * e) / e !== value) {
    e *= 10
    p += 1
  }
  return p
}

export const increment = (v: number | string, s: number) => decimalOperation(valueOf(v), "+", s)

export const decrement = (v: number | string, s: number) => decimalOperation(valueOf(v), "-", s)

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

export type FormatDecimalOptions = {
  /**
   * The minimum number of fraction digits to use. Possible values are from 0 to 20
   */
  minFractionDigits?: number
  /**
   * The maximum number of fraction digits to use. Possible values are from 0 to 20;
   */
  maxFractionDigits?: number
}

export function formatDecimal(v: number | string, o: Omit<FormatDecimalOptions, "value">) {
  return new Intl.NumberFormat("en-US", {
    useGrouping: false,
    style: "decimal",
    minimumFractionDigits: o.minFractionDigits,
    maximumFractionDigits: o.maxFractionDigits,
  }).format(valueOf(v))
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

function decimalOperation(a: number, op: "-" | "+", b: number): number {
  let result = op === "+" ? a + b : a - b

  // Check if we have decimals
  if (a % 1 !== 0 || b % 1 !== 0) {
    const multiplier = 10 ** Math.max(countDecimals(a), countDecimals(b))

    // Transform the decimals to integers based on the precision
    a = Math.round(a * multiplier)
    b = Math.round(b * multiplier)

    // Perform the operation on integers values to make sure we don't get a fancy decimal value
    result = op === "+" ? a + b : a - b

    // Transform the integer result back to decimal
    result /= multiplier
  }

  return result
}
