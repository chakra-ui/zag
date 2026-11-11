import { clampValue, getValuePercent, isNumber } from "@zag-js/utils"
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

export function validateMeterBounds(min: number, max: number, low?: number, high?: number, optimum?: number) {
  assertValidNumber("min", min)
  assertValidNumber("max", max)

  if (min > max) {
    throw new Error(`[meter] The min value \`${min}\` must not exceed the max value \`${max}\``)
  }

  if (low !== undefined) assertValidNumber("low", low)
  if (high !== undefined) assertValidNumber("high", high)
  if (optimum !== undefined) assertValidNumber("optimum", optimum)
}

// https://html.spec.whatwg.org/multipage/form-elements.html#the-meter-element
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

export function getClampedValue(value: number, min: number, max: number) {
  return clampValue(Number.isNaN(value) ? min : value, min, max)
}

export function getPercent(value: number, min: number, max: number) {
  return max === min ? 0 : getValuePercent(value, min, max) * 100
}
