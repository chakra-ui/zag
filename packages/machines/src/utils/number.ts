type Num<T extends string> = Record<T, number>

export function wrap(num: number, max: number) {
  return ((num % max) + max) % max
}

export function roundPx(num: number, dp?: number) {
  if (dp != null) {
    const dp = window.devicePixelRatio
    return Math.floor(num * dp + 0.5) / dp
  }
  return Math.round(num)
}

const decimalFormat = new Intl.NumberFormat("en-US", { style: "decimal" })

function formatter(n: number) {
  return parseFloat(decimalFormat.format(n))
}

export function countDecimals(v: number | undefined) {
  return decimalFormat.formatToParts(v).find((p) => p.type === "fraction")?.value.length ?? 0
}

export const valueToPercent = (v: number, r: Num<"step" | "min" | "max">) => ((v - r.min) * 100) / (r.max - r.min)

export const percentToValue = (v: number, r: Num<"min" | "max">) => r.min + (r.max - r.min) * v

export const transform = (a: [number, number], b: [number, number]) => {
  const i = { min: a[0], max: a[1] }
  const o = { min: b[0], max: b[1] }
  return (v: number) => {
    if (i.min === i.max || o.min === o.max) return o.min
    const ratio = (o.max - o.min) / (i.max - i.min)
    return o.min + ratio * (v - i.min)
  }
}

export const clamp = (v: number, o: Num<"min" | "max">) => Math.min(Math.max(v, o.min), o.max)
export const increment = (v: number, s: number) => formatter(v + s)
export const decrement = (v: number, s: number) => formatter(v - s)
export const multiply = (v: number, s: number) => formatter(v * s)

export function round(v: number, t?: number) {
  const p = 10 ** (t ?? 10)
  v = Math.round(v * p) / p
  return t ? v.toFixed(t) : v.toString()
}

export function snapToStep(value: number, step: number) {
  const p = countDecimals(step)
  const v = Math.round(value / step) * step
  return round(v, p)
}

export function toRanges(o: Num<"min" | "max"> & { value: number[]; spacing: number }) {
  const spacing = o.spacing ?? 0
  return o.value.map((v, i) => {
    const min = i === 0 ? o.min : o.value[i - 1] + spacing
    const max = i === o.value.length - 1 ? o.max : o.value[i + 1] - spacing
    return { min, max, value: v }
  })
}

export function valueOf(v: string | number) {
  const num = parseFloat(v.toString().replace(/[^\w.-]+/g, ""))
  return !isNaN(num) ? num : 0
}

export function getMaxPrecision(o: { value: string | number; precision?: number; step: number }) {
  const stepPrecision = countDecimals(o.step)
  const val = valueOf(o.value)
  const valuePrecision = isNaN(val) ? stepPrecision : Math.max(countDecimals(val), stepPrecision)
  return Math.max(valuePrecision, o.precision ?? 0)
}

export const isAtMax = (v: number, o: Num<"max">) => v >= o.max
export const isAtMin = (v: number, o: Num<"min">) => v <= o.min
export const isWithinRange = (v: number, o: Num<"min" | "max">) => v >= o.min && v <= o.max

export function toRangeArray(o: Num<"min" | "max" | "step">): number[] {
  let i = o.min
  const range: number[] = []
  while (i <= o.max) {
    range.push(i)
    i = increment(i, o.step)
  }
  return range
}

export type RangeOptions<T = string | number> = Num<"min" | "max"> & {
  step: number
  precision?: number
  value: T
}

export function rangy(options: RangeOptions) {
  const { min, max, step, precision, value } = options

  const utils = {
    isInRange() {
      return isWithinRange(utils.getValueAsNumber(), { min, max })
    },
    isAtMax() {
      return isAtMax(utils.getValueAsNumber(), { max })
    },
    isAtMin() {
      return isAtMin(utils.getValueAsNumber(), { min })
    },
    snapToStep() {
      const value = snapToStep(utils.getValueAsNumber(), step)
      return rangy({ ...options, value })
    },
    increment(stepOverride?: number) {
      const value = increment(utils.getValueAsNumber(), stepOverride ?? step)
      return rangy({ ...options, value })
    },
    decrement(stepOverride?: number) {
      const value = decrement(utils.getValueAsNumber(), stepOverride ?? step)
      return rangy({ ...options, value })
    },
    toPrecision() {
      return rangy({ ...options, value: utils.getValue() })
    },
    toMax() {
      return rangy({ ...options, value: max })
    },
    toMin() {
      return rangy({ ...options, value: min })
    },
    fromPercent(percent: number) {
      const value = percentToValue(percent, { min, max })
      return rangy({ ...options, value })
    },
    clamp() {
      const value = clamp(utils.getValueAsNumber(), { min, max })
      return rangy({ ...options, value })
    },
    getPercent() {
      return valueToPercent(utils.getValueAsNumber(), { min, max, step })
    },
    getValueAsNumber() {
      return valueOf(value)
    },
    getValue() {
      return round(utils.getValueAsNumber(), utils.getPrecision())
    },
    getPrecision() {
      return getMaxPrecision({ value, precision, step })
    },
  }

  return utils
}
