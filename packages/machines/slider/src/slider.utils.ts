import type { Params } from "@zag-js/core"
import { clampValue, getNextStepValue, getPreviousStepValue, getValueRanges, snapValueToStep } from "@zag-js/utils"
import type { SliderSchema } from "./slider.types"

type Ctx = Params<SliderSchema>

export function normalizeValues(params: Ctx, nextValues: number[]) {
  return nextValues.map((value, index) => {
    return constrainValue(params, value, index)
  })
}

export function getRangeAtIndex(params: Pick<Ctx, "context" | "prop">, index: number) {
  const { context, prop } = params
  const step = prop("step") * prop("minStepsBetweenThumbs")
  return getValueRanges(context.get("value"), prop("min"), prop("max"), step)[index]
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
  const values = context.get("value")

  // Find the closest thumb by distance
  let closestIndex = 0
  let minDistance = Math.abs(values[0] - pointValue)

  for (let i = 1; i < values.length; i++) {
    const distance = Math.abs(values[i] - pointValue)
    // Use <= to prefer later thumbs when distances are equal
    if (distance <= minDistance) {
      closestIndex = i
      minDistance = distance
    }
  }

  return selectMovableThumb(params, closestIndex)
}

/**
 * When multiple thumbs are stacked at max, select the one that can actually move.
 * At max: only the FIRST thumb can move (down/left), others are locked at the boundary.
 * At other values: all thumbs can move (in different directions), so don't switch.
 */
export function selectMovableThumb(params: Pick<Ctx, "context" | "prop">, index: number) {
  const { context, prop } = params
  const values = context.get("value")
  const max = prop("max")
  const thumbValue = values[index]

  // Only handle collision at max value
  // At max: walk backwards to find the first thumb (only one that can move down)
  if (thumbValue === max) {
    let movableIndex = index
    while (movableIndex > 0 && values[movableIndex - 1] === max) {
      movableIndex -= 1
    }
    return movableIndex
  }

  // At other values, both thumbs can move in different directions
  // User should click the thumb corresponding to their intended direction
  return index
}

export function assignArray(current: number[], next: number[]) {
  for (let i = 0; i < next.length; i++) {
    const value = next[i]
    current[i] = value
  }
}
