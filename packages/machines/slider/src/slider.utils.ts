import type { Params } from "@zag-js/core"
import { clampValue, getValuePercent, getValueRanges, setValueAtIndex, snapValueToStep } from "@zag-js/utils"
import type { Size } from "@zag-js/types"
import type { SliderOrigin, SliderSchema, ThumbCollisionBehavior } from "./slider.types"

type Ctx = Params<SliderSchema>

interface ThumbCollisionContext {
  behavior: ThumbCollisionBehavior
  index: number
  value: number
  values: number[]
  min: number
  max: number
  gap: number
}

interface ThumbCollisionResult {
  values: number[]
  index: number
  swapped: boolean
}

function getThumbBounds(ctx: ThumbCollisionContext) {
  const { index, values, min, max, gap } = ctx
  const prevThumb = values[index - 1]
  const nextThumb = values[index + 1]
  return {
    min: prevThumb != null ? prevThumb + gap : min,
    max: nextThumb != null ? nextThumb - gap : max,
  }
}

function round(value: number) {
  return Math.round(value * 1e10) / 1e10
}

function handleNone(ctx: ThumbCollisionContext): ThumbCollisionResult {
  const { index, value, values } = ctx
  const bounds = getThumbBounds(ctx)
  const nextValues = values.slice()
  nextValues[index] = round(clampValue(value, bounds.min, bounds.max))
  return { values: nextValues, index, swapped: false }
}

function handlePush(ctx: ThumbCollisionContext): ThumbCollisionResult {
  const { index, value, values, min, max, gap } = ctx
  const nextValues = values.slice()

  // clamp the dragged thumb within absolute bounds (accounting for other thumbs' space)
  const absoluteMin = min + index * gap
  const absoluteMax = max - (values.length - 1 - index) * gap
  nextValues[index] = round(clampValue(value, absoluteMin, absoluteMax))

  // push thumbs to the right if they overlap
  for (let i = index + 1; i < values.length; i++) {
    const minAllowed = nextValues[i - 1] + gap
    if (nextValues[i] < minAllowed) {
      nextValues[i] = round(minAllowed)
    }
  }

  // push thumbs to the left if they overlap
  for (let i = index - 1; i >= 0; i--) {
    const maxAllowed = nextValues[i + 1] - gap
    if (nextValues[i] > maxAllowed) {
      nextValues[i] = round(maxAllowed)
    }
  }

  return { values: nextValues, index, swapped: false }
}

function handleSwap(ctx: ThumbCollisionContext, startValue: number): ThumbCollisionResult {
  const { index, value, values, gap } = ctx

  const prevThumb = values[index - 1]
  const nextThumb = values[index + 1]

  // check if we're crossing over a neighbor
  const crossingNext = nextThumb != null && value >= nextThumb && value > startValue
  const crossingPrev = prevThumb != null && value <= prevThumb && value < startValue

  if (!crossingNext && !crossingPrev) {
    // no swap needed, just clamp within bounds
    return handleNone(ctx)
  }

  // determine which thumb we're swapping with
  const swapIndex = crossingNext ? index + 1 : index - 1
  const nextValues = values.slice()

  // the dragged thumb takes the neighbor's position (clamped)
  const newCtx = { ...ctx, index: swapIndex }
  const bounds = getThumbBounds(newCtx)
  nextValues[swapIndex] = round(clampValue(value, bounds.min, bounds.max))

  // the neighbor thumb stays at its current position (becomes the "other" thumb)
  nextValues[index] = values[swapIndex]

  // ensure proper ordering after swap
  if (crossingNext && nextValues[index] > nextValues[swapIndex] - gap) {
    nextValues[index] = round(nextValues[swapIndex] - gap)
  } else if (crossingPrev && nextValues[index] < nextValues[swapIndex] + gap) {
    nextValues[index] = round(nextValues[swapIndex] + gap)
  }

  return { values: nextValues, index: swapIndex, swapped: true }
}

export function resolveThumbCollision(
  behavior: ThumbCollisionBehavior,
  index: number,
  value: number,
  values: number[],
  min: number,
  max: number,
  step: number,
  minStepsBetweenThumbs: number,
  startValue?: number,
): ThumbCollisionResult {
  // single thumb - no collision possible
  if (values.length === 1) {
    return { values: [round(clampValue(value, min, max))], index: 0, swapped: false }
  }

  const gap = step * minStepsBetweenThumbs
  const ctx: ThumbCollisionContext = { behavior, index, value, values, min, max, gap }

  switch (behavior) {
    case "push":
      return handlePush(ctx)
    case "swap":
      return handleSwap(ctx, startValue ?? values[index])
    case "none":
    default:
      return handleNone(ctx)
  }
}

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

export function stepThumb(params: Pick<Ctx, "context" | "prop">, delta: number, index?: number) {
  const { context } = params
  const idx = index ?? context.get("focusedIndex")
  const values = context.get("value")
  return setValueAtIndex(values, idx, constrainValue(params, values[idx] + delta, idx))
}

export function getClosestIndex(params: Pick<Ctx, "context" | "prop">, pointValue: number) {
  const { context } = params
  const values = context.get("value")

  let closestIndex = 0
  let minDistance = Math.abs(values[0] - pointValue)

  for (let i = 1; i < values.length; i++) {
    const distance = Math.abs(values[i] - pointValue)
    // use <= to prefer later thumbs when distances are equal
    if (distance <= minDistance) {
      closestIndex = i
      minDistance = distance
    }
  }

  return selectMovableThumb(params, closestIndex)
}

export function selectMovableThumb(params: Pick<Ctx, "context" | "prop">, index: number) {
  const { context, prop } = params
  const values = context.get("value")
  const max = prop("max")
  const thumbValue = values[index]

  // when multiple thumbs are stacked at max, select the first thumb (only one that can move)
  if (thumbValue === max) {
    let movableIndex = index
    while (movableIndex > 0 && values[movableIndex - 1] === max) {
      movableIndex -= 1
    }
    return movableIndex
  }

  return index
}

/** Resolves the `origin` prop to a percent position (0-100) within `min`-`max`. */
export function getOriginPercent(origin: SliderOrigin, min: number, max: number): number {
  if (typeof origin === "number") {
    return clampValue(100 * getValuePercent(origin, min, max), 0, 100)
  }
  switch (origin) {
    case "end":
      return 100
    case "center":
      return 50
    case "start":
    default:
      return 0
  }
}

export function getFillSpan(params: Pick<Ctx, "computed" | "prop">): [number, number] {
  const { computed, prop } = params
  const percents = computed("valuePercent")
  if (percents.length > 1) return [percents[0], percents[percents.length - 1]]
  const origin = getOriginPercent(prop("origin"), prop("min"), prop("max"))
  const value = percents[0]
  return value < origin ? [value, origin] : [origin, value]
}

export function getThumbExtent(params: Pick<Ctx, "context" | "prop">) {
  const { context, prop } = params
  if (prop("thumbAlignment") !== "contain") return 0
  const size = context.get("thumbSize")
  return (prop("orientation") === "vertical" ? size?.height : size?.width) ?? 0
}

export const toThumbSize = (size: number | Size | undefined): Size | null => {
  if (size == null) return null
  return typeof size === "number" ? { width: size, height: size } : size
}
