const { floor, round, min, max } = Math

export const isNaN = (v: number) => Number.isNaN(v)

export const nan = (v: number) => (isNaN(v) ? 0 : v)
export const mod = (v: number, m: number) => ((v % m) + m) % m
export const wrap = (v: number, vmax: number) => ((v % vmax) + vmax) % vmax

export const isValueWithinRange = (v: number, vmin: number | null | undefined, vmax: number | null | undefined) => {
  const value = nan(v)
  return (vmin == null || value >= vmin) && (vmax == null || value <= vmax)
}

export const clampValue = (v: number, vmin: number, vmax: number) => min(max(nan(v), vmin), vmax)
export const clampPercent = (v: number) => clampValue(v, 0, 1)

/** Where a value sits between bounds, from 0 to 1. An empty range is 0. */
export const getValuePercent = (v: number, vmin: number, vmax: number) =>
  vmax === vmin ? 0 : (nan(v) - vmin) / (vmax - vmin)

/** The value at a fraction of the range, on the step grid. */
export const getPercentValue = (p: number, vmin: number, vmax: number, step: number) =>
  clampValue(snapToGrid(p * (vmax - vmin) + vmin, vmin, step, round), vmin, vmax)

/** Decimal places a number is written with, including exponent notation like `1e-7`. */
export const decimalsOf = (v: number) => {
  if (!Number.isFinite(v) || Number.isInteger(v)) return 0
  const [mantissa, exponent = "0"] = String(v).toLowerCase().split("e")
  return max(0, (mantissa.split(".")[1]?.length ?? 0) - Number(exponent))
}

export const toFixedNumber = (v: number, d = 0, b = 10) => {
  const p = Math.pow(b, d)
  return round(v * p) / p
}

const roundTo = (v: number, decimals: number) => {
  const p = 10 ** decimals
  return round(v * p) / p
}

/**
 * A value on the step grid that starts at `base`, with `fn` choosing the step (round, floor or ceil).
 * Counts steps in scaled integers so decimal steps don't drift, then trims leftover float noise.
 */
const snapToGrid = (v: number, base: number, step: number, fn: (steps: number) => number) => {
  const decimals = max(decimalsOf(step), decimalsOf(base))
  const scale = 10 ** decimals
  const trim = (n: number) => Number(n.toPrecision(15))
  const count = trim((trim(v * scale) - round(base * scale)) / round(step * scale))
  return roundTo(base + fn(count) * step, decimals)
}

/** Rounds away float noise, keeping one decimal past the step for a min or max off the grid. */
export const roundToStepPrecision = (v: number, step: number) => {
  const decimals = decimalsOf(step)
  return decimals === 0 ? v : roundTo(v, decimals + 1)
}

export const roundToDpr = (v: number, dpr: unknown) => (typeof dpr === "number" ? floor(v * dpr + 0.5) / dpr : round(v))

/** The nearest value on the step grid (starting at `min`), within the bounds. */
export const snapValueToStep = (v: number, vmin: number | undefined, vmax: number | undefined, step: number) => {
  const lo = vmin != null ? Number(vmin) : 0
  const hi = Number(vmax)
  if (!(step > 0)) return clampValue(v, isNaN(lo) ? -Infinity : lo, isNaN(hi) ? Infinity : hi)

  const snapped = snapToGrid(v, lo, step, round)
  if (!isNaN(lo) && snapped < lo) return lo
  if (!isNaN(hi) && snapped > hi) {
    // The largest value on the grid, or `max` when no whole step fits in the range
    const top = snapToGrid(hi, lo, step, floor)
    return top <= lo ? hi : top
  }
  return snapped
}

/** The value on the step grid in a direction: down for -1, up for 1. Values on the grid stay. */
export const snapValueToStepDirection = (v: number, base: number, step: number, direction: number) =>
  snapToGrid(v, base, step, direction > 0 ? floor : Math.ceil)

export const setValueAtIndex = <T>(vs: T[], i: number, v: T) => {
  if (vs[i] === v) return vs
  return [...vs.slice(0, i), v, ...vs.slice(i + 1)]
}

export const getValueRanges = (vs: number[], vmin: number, vmax: number, gap: number) =>
  vs.map((v, i) => ({
    min: i === 0 ? vmin : vs[i - 1] + gap,
    max: i === vs.length - 1 ? vmax : vs[i + 1] - gap,
    value: v,
  }))

const decimalOp = (a: number, op: "-" | "+", b: number): number => {
  if (Number.isInteger(a) && Number.isInteger(b)) return op === "+" ? a + b : a - b
  const decimals = max(decimalsOf(a), decimalsOf(b))
  return roundTo(op === "+" ? a + b : a - b, decimals)
}

export const incrementValue = (v: number, s: number) => decimalOp(nan(v), "+", s)

export const decrementValue = (v: number, s: number) => decimalOp(nan(v), "-", s)

export const toPx = (v: number | string | undefined) => (typeof v === "number" ? `${v}px` : v)
