import { clampValue, isNumber } from "@zag-js/utils"
import type { MeterValueState } from "./meter.types"

export interface MeterBounds {
  min: number
  max: number
  low: number
  high: number
  optimum: number
}

function assertValidNumber(name: string, value: unknown) {
  if (!isNumber(value)) {
    throw new Error(`[meter] The ${name} value passed \`${value}\` is not a valid number`)
  }
}

/**
 * Validate the numbers the caller passed in. Out-of-range `low` / `high` /
 * `optimum` are still clamped later, matching HTML `<meter>`.
 */
export function validateMeterBounds(min: number, max: number, low?: number, high?: number, optimum?: number) {
  assertValidNumber("min", min)
  assertValidNumber("max", max)

  if (min >= max) {
    throw new Error(`[meter] The min value \`${min}\` must be less than the max value \`${max}\``)
  }

  if (low !== undefined) assertValidNumber("low", low)
  if (high !== undefined) assertValidNumber("high", high)
  if (optimum !== undefined) assertValidNumber("optimum", optimum)
}

/**
 * Resolve `low`, `high`, and `optimum` the way the HTML `<meter>` element does.
 * @see https://html.spec.whatwg.org/multipage/form-elements.html#the-meter-element
 */
export function resolveMeterBounds(
  min: number,
  max: number,
  low?: number,
  high?: number,
  optimum?: number,
): MeterBounds {
  let resolvedLow = low ?? min
  let resolvedHigh = high ?? max
  let resolvedOptimum = optimum ?? min + (max - min) / 2

  resolvedLow = clampValue(resolvedLow, min, max)
  resolvedHigh = clampValue(resolvedHigh, min, max)
  if (resolvedHigh < resolvedLow) resolvedHigh = resolvedLow
  resolvedOptimum = clampValue(resolvedOptimum, min, max)

  return { min, max, low: resolvedLow, high: resolvedHigh, optimum: resolvedOptimum }
}

/**
 * Which of the three HTML meter regions the current value falls in.
 * @see https://html.spec.whatwg.org/multipage/form-elements.html#the-meter-element
 */
export function getMeterValueState(value: number, bounds: MeterBounds): MeterValueState {
  const { low, high, optimum } = bounds

  if (optimum < low) {
    if (value < low) return "optimal"
    if (value <= high) return "suboptimal"
    return "least-optimal"
  }

  if (optimum > high) {
    if (value > high) return "optimal"
    if (value >= low) return "suboptimal"
    return "least-optimal"
  }

  if (value >= low && value <= high) return "optimal"
  return "suboptimal"
}
