export type Num<T extends string> = Record<T, number>

export function wrap(num: number, max: number): number {
  return ((num % max) + max) % max
}

export function round(num: number, t?: number) {
  const p = 10 ** (t ?? 10)
  num = Math.round(num * p) / p
  return t ? num.toFixed(t) : num.toString()
}

export function roundToDevicePixel(num: number) {
  if (typeof window.devicePixelRatio !== "number") return Math.round(num)
  const dp = window.devicePixelRatio
  return Math.floor(num * dp + 0.5) / dp
}

export const valueToPercent = (v: number, r: Num<"step" | "min" | "max">) => ((nan(v) - r.min) * 100) / (r.max - r.min)

export const percentToValue = (v: number, r: Num<"min" | "max">) => r.min + (r.max - r.min) * nan(v)

export function clamp(v: number, o: Num<"min" | "max">) {
  return Math.min(Math.max(nan(v), o.min), o.max)
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

export const increment = (v: number, s: number) => decimalOperation(nan(v), "+", s)

export const decrement = (v: number, s: number) => decimalOperation(nan(v), "-", s)

export function snapToStep(num: number, step: number) {
  const p = countDecimals(step)
  const v = Math.round(nan(num) / step) * step
  return round(v, p)
}

export function nan(v: number) {
  return Number.isNaN(v) ? 0 : v
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

export function formatDecimal(v: number, o: Omit<FormatDecimalOptions, "value">) {
  return new Intl.NumberFormat("en-US", {
    useGrouping: false,
    style: "decimal",
    minimumFractionDigits: o.minFractionDigits,
    maximumFractionDigits: o.maxFractionDigits,
  }).format(nan(v))
}

export function isAtMax(val: number, o: Num<"max">) {
  return nan(val) >= o.max
}

export function isAtMin(val: number, o: Num<"min">) {
  return nan(val) <= o.min
}

export function isWithinRange(val: number, o: Num<"min" | "max">) {
  return nan(val) >= o.min && nan(val) <= o.max
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
