import { clampValue, getNextStepValue, getPreviousStepValue, snapValueToStep } from "@zag-js/numeric-range"
import type { MachineContext as Ctx } from "./slider.types"

export function clampPercent(percent: number) {
  return clampValue(percent, 0, 1)
}

export function constrainValue(ctx: Ctx, value: number) {
  const snapValue = snapValueToStep(value, ctx.min, ctx.max, ctx.step)
  return clampValue(snapValue, ctx.min, ctx.max)
}

export function decrement(ctx: Ctx, step?: number) {
  const index = 0
  const values = getPreviousStepValue(index, {
    ...ctx,
    step: step ?? ctx.step,
    values: [ctx.value],
  })
  return values[index]
}

export function increment(ctx: Ctx, step?: number) {
  const index = 0
  const values = getNextStepValue(index, {
    ...ctx,
    step: step ?? ctx.step,
    values: [ctx.value],
  })
  return values[index]
}
