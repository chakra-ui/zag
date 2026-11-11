import { clampValue, getValuePercent } from "@zag-js/utils"
import type { ProgressState } from "./progress.types"

// NaN and Infinity have no position on the bar, so they read as indeterminate
export const isFiniteNumber = (value: number | null | undefined): value is number =>
  value != null && Number.isFinite(value)

export function getClampedValue(value: number | null | undefined, min: number, max: number) {
  return isFiniteNumber(value) ? clampValue(value, min, max) : null
}

export function getPercent(value: number | null, min: number, max: number) {
  if (value === null || max === min) return 0
  return getValuePercent(value, min, max) * 100
}

export function getProgressState(value: number | null, max: number): ProgressState {
  return value === null ? "indeterminate" : value === max ? "complete" : "loading"
}
