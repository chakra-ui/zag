const { floor, abs, round, min, max, pow, sign } = Math

export const isNaN = (v: number) => Number.isNaN(v)

export const nan = (v: number) => (isNaN(v) ? 0 : v)
export const mod = (v: number, m: number) => ((v % m) + m) % m
export const wrap = (v: number, vmax: number) => ((v % vmax) + vmax) % vmax

export const getMinValueAtIndex = (i: number, v: number[], vmin: number) => (i === 0 ? vmin : v[i - 1])
export const getMaxValueAtIndex = (i: number, v: number[], vmax: number) => (i === v.length - 1 ? vmax : v[i + 1])

export const isValueAtMax = (v: number, vmax: number) => nan(v) >= vmax
export const isValueAtMin = (v: number, vmin: number) => nan(v) <= vmin
export const isValueWithinRange = (v: number, vmin: number, vmax: number) => nan(v) >= vmin && nan(v) <= vmax

export const roundValue = (v: number, vmin: number, step: number) => round((nan(v) - vmin) / step) * step + vmin
export const clampValue = (v: number, vmin: number, vmax: number) => min(max(nan(v), vmin), vmax)
export const clampPercent = (v: number) => clampValue(v, 0, 1)

export const getValuePercent = (v: number, vmin: number, vmax: number) => (nan(v) - vmin) / (vmax - vmin)

export const getPercentValue = (p: number, vmin: number, vmax: number, step: number) =>
  clampValue(roundValue(p * (vmax - vmin) + vmin, vmin, step), vmin, vmax)

export const roundToStepPrecision = (v: number, step: number) => {
  let rv = v
  let ss = step.toString()
  let pi = ss.indexOf(".")
  let p = pi >= 0 ? ss.length - pi : 0
  if (p > 0) {
    let pw = pow(10, p)
    rv = round(rv * pw) / pw
  }
  return rv
}

export const roundToDpr = (v: number, dpr: unknown) => (typeof dpr === "number" ? floor(v * dpr + 0.5) / dpr : round(v))

export const snapValueToStep = (v: number, vmin: number | undefined, vmax: number | undefined, step: number) => {
  vmin = Number(vmin)
  vmax = Number(vmax)
  let remainder = (v - (isNaN(vmin) ? 0 : vmin)) % step
  let sv = roundToStepPrecision(
    abs(remainder) * 2 >= step ? v + sign(remainder) * (step - abs(remainder)) : v - remainder,
    step,
  )
  if (!isNaN(vmin)) {
    if (sv < vmin) {
      sv = vmin
    } else if (!isNaN(vmax) && sv > vmax) {
      sv = vmin + floor(roundToStepPrecision((vmax - vmin) / step, step)) * step
    }
  } else if (!isNaN(vmax) && sv > vmax) {
    sv = vmin + floor(roundToStepPrecision((vmax - vmin) / step, step)) * step
  }
  return roundToStepPrecision(sv, step)
}

export const setValueAtIndex = <T>(vs: T[], i: number, v: T) => {
  if (vs[i] === v) return vs
  return [...vs.slice(0, i), v, ...vs.slice(i + 1)]
}

interface RangeContext {
  min: number
  max: number
  step: number
  values: number[]
}

export function getValueSetterAtIndex(index: number, ctx: RangeContext) {
  const minValueAtIndex = getMinValueAtIndex(index, ctx.values, ctx.min)
  const maxValueAtIndex = getMaxValueAtIndex(index, ctx.values, ctx.max)
  let nextValues = ctx.values.slice()

  return function setValue(value: number) {
    let nextValue = snapValueToStep(value, minValueAtIndex, maxValueAtIndex, ctx.step)
    nextValues = setValueAtIndex(nextValues, index, value)
    nextValues[index] = nextValue
    return nextValues
  }
}

export function getNextStepValue(index: number, ctx: RangeContext) {
  const nextValue = ctx.values[index] + ctx.step
  return getValueSetterAtIndex(index, ctx)(nextValue)
}

export function getPreviousStepValue(index: number, ctx: RangeContext) {
  const nextValue = ctx.values[index] - ctx.step
  return getValueSetterAtIndex(index, ctx)(nextValue)
}

export const getClosestValueIndex = (vs: number[], t: number) => {
  let i = vs.findIndex((v) => t - v < 0)
  if (i === 0) return i
  if (i === -1) return vs.length - 1
  let vLeft = vs[i - 1]
  let vRight = vs[i]
  if (abs(vLeft - t) < abs(vRight - t)) return i - 1
  return i
}

export const getClosestValue = (vs: number[], t: number) => vs[getClosestValueIndex(vs, t)]

export const getValueRanges = (vs: number[], vmin: number, vmax: number, gap: number) =>
  vs.map((v, i) => ({
    min: i === 0 ? vmin : vs[i - 1] + gap,
    max: i === vs.length - 1 ? vmax : vs[i + 1] - gap,
    value: v,
  }))

export const getValueTransformer = (va: number[], vb: number[]) => {
  const [a, b] = va
  const [c, d] = vb
  return (v: number) => (a === b || c === d ? c : c + ((d - c) / (b - a)) * (v - a))
}

export const toFixedNumber = (v: number, d = 0, b = 10) => {
  const pow = Math.pow(b, d)
  return round(v * pow) / pow
}

const countDecimals = (value: number) => {
  if (!Number.isFinite(value)) return 0
  let e = 1,
    p = 0
  while (Math.round(value * e) / e !== value) {
    e *= 10
    p += 1
  }
  return p
}

const decimalOp = (a: number, op: "-" | "+", b: number): number => {
  let result = op === "+" ? a + b : a - b
  if (a % 1 !== 0 || b % 1 !== 0) {
    const multiplier = 10 ** Math.max(countDecimals(a), countDecimals(b))
    a = Math.round(a * multiplier)
    b = Math.round(b * multiplier)
    result = op === "+" ? a + b : a - b
    result /= multiplier
  }
  return result
}

export const incrementValue = (v: number, s: number) => decimalOp(nan(v), "+", s)

export const decrementValue = (v: number, s: number) => decimalOp(nan(v), "-", s)

export const toPx = (v: number | undefined) => (v != null ? `${v}px` : undefined)
