import type { Params } from "@zag-js/core"
import {
  clampValue,
  getClosestValueIndex,
  getNextStepValue,
  getPreviousStepValue,
  getValueRanges,
  snapValueToStep,
} from "@zag-js/utils"
import type { SliderSchema } from "./slider.types"

type Ctx = Params<SliderSchema>

export function normalizeValues(params: Ctx, nextValues: number[]) {
  return nextValues.map((value, index) => {
    return constrainValue(params, value, index)
  })
}

export function getRangeAtIndex(params: Pick<Ctx, "context" | "prop">, index: number) {
  const { context, prop } = params
  return getValueRanges(context.get("value"), prop("min"), prop("max"), prop("minStepsBetweenThumbs"))[index]
}

export function constrainValue(params: Pick<Ctx, "context" | "prop">, value: number, index: number) {
  const { prop } = params
  const range = getRangeAtIndex(params, index)
  const snapValue = snapValueToStep(value, prop("min"), prop("max"), prop("step"))
  return clampValue(snapValue, range.min, range.max)
}

export function decrement(params: Pick<Ctx, "context" | "prop">, index?: number, step?: number) {
  const { context, prop } = params
  const idx = index ?? context.get("focusedIndex")
  const range = getRangeAtIndex(params, idx)
  const nextValues = getPreviousStepValue(idx, {
    ...range,
    step: step ?? prop("step"),
    values: context.get("value"),
  })
  nextValues[idx] = clampValue(nextValues[idx], range.min, range.max)
  return nextValues
}

export function increment(params: Pick<Ctx, "context" | "prop">, index?: number, step?: number) {
  const { context, prop } = params
  const idx = index ?? context.get("focusedIndex")
  const range = getRangeAtIndex(params, idx)
  const nextValues = getNextStepValue(idx, {
    ...range,
    step: step ?? prop("step"),
    values: context.get("value"),
  })
  nextValues[idx] = clampValue(nextValues[idx], range.min, range.max)
  return nextValues
}

export function getClosestIndex(params: Pick<Ctx, "context" | "prop">, pointValue: number) {
  const { context } = params
  return getClosestValueIndex(context.get("value"), pointValue)
}

export function assignArray(current: number[], next: number[]) {
  for (let i = 0; i < next.length; i++) {
    const value = next[i]
    current[i] = value
  }
}
