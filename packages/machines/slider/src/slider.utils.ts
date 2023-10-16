import {
  clampValue,
  getClosestValueIndex,
  getNextStepValue,
  getPreviousStepValue,
  getValueRanges,
  snapValueToStep,
} from "@zag-js/numeric-range"
import type { MachineContext as Ctx } from "./slider.types"

export function normalizeValues(ctx: Ctx, nextValues: number[]) {
  return nextValues.map((value, index, values) => {
    return constrainValue({ ...ctx, value: values }, value, index)
  })
}

export function clampPercent(percent: number) {
  return clampValue(percent, 0, 1)
}

export function getRangeAtIndex(ctx: Ctx, index: number) {
  return getValueRanges(ctx.value, ctx.min, ctx.max, ctx.minStepsBetweenThumbs)[index]
}

export function constrainValue(ctx: Ctx, value: number, index: number) {
  const range = getRangeAtIndex(ctx, index)
  const snapValue = snapValueToStep(value, ctx.min, ctx.max, ctx.step)
  return clampValue(snapValue, range.min, range.max)
}

export function decrement(ctx: Ctx, index?: number, step?: number) {
  const idx = index ?? ctx.focusedIndex
  const range = getRangeAtIndex(ctx, idx)
  const nextValues = getPreviousStepValue(idx, {
    ...range,
    step: step ?? ctx.step,
    values: ctx.value,
  })
  nextValues[idx] = clampValue(nextValues[idx], range.min, range.max)
  return nextValues
}

export function increment(ctx: Ctx, index?: number, step?: number) {
  const idx = index ?? ctx.focusedIndex
  const range = getRangeAtIndex(ctx, idx)
  const nextValues = getNextStepValue(idx, {
    ...range,
    step: step ?? ctx.step,
    values: ctx.value,
  })
  nextValues[idx] = clampValue(nextValues[idx], range.min, range.max)
  return nextValues
}

export function getClosestIndex(ctx: Ctx, pointValue: number) {
  return getClosestValueIndex(ctx.value, pointValue)
}

export function assignArray(current: number[], next: number[]) {
  for (let i = 0; i < next.length; i++) {
    const value = next[i]
    current[i] = value
  }
}
