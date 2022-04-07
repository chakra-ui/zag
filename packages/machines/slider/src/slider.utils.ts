import { clamp, decrement, increment, percentToValue, snapToStep } from "@zag-js/number-utils"
import { MachineContext as Ctx } from "./slider.types"

export const utils = {
  fromPercent(ctx: Ctx, percent: number) {
    percent = clamp(percent, { min: 0, max: 1 })
    return parseFloat(snapToStep(percentToValue(percent, ctx), ctx.step))
  },
  clamp(ctx: Ctx, value: number) {
    return clamp(value, ctx)
  },
  convert(ctx: Ctx, value: number) {
    return clamp(parseFloat(snapToStep(value, ctx.step)), ctx)
  },
  decrement(ctx: Ctx, step?: number) {
    let value = decrement(ctx.value, step ?? ctx.step)
    return utils.convert(ctx, value)
  },
  increment(ctx: Ctx, step?: number) {
    let value = increment(ctx.value, step ?? ctx.step)
    return utils.convert(ctx, value)
  },
}
