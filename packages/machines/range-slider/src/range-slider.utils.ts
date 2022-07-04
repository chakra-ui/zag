import { clamp, decrement, increment, percentToValue, snapToStep, toRanges } from "@zag-js/number-utils"
import type { MachineContext as Ctx } from "./range-slider.types"

export const utils = {
  check(ctx: Ctx, values: number[]) {
    return values.map((value, index) => utils.convert(ctx, value, index))
  },
  clampPercent(value: number) {
    return clamp(value, { min: 0, max: 1 })
  },
  getRangeAtIndex(ctx: Ctx, index = ctx.activeIndex) {
    return toRanges(ctx)[index]
  },
  fromPercent(ctx: Ctx, percent: number) {
    const range = utils.getRangeAtIndex(ctx)

    const maxPercent = range.max / ctx.max
    const minPercent = range.min / ctx.max

    percent = clamp(percent, { min: minPercent, max: maxPercent })
    const value = percentToValue(percent, ctx)

    return parseFloat(snapToStep(value, ctx.step))
  },
  convert(ctx: Ctx, value: number, index: number) {
    const range = utils.getRangeAtIndex(ctx, index)
    return clamp(snapToStep(value, ctx.step), range)
  },
  decrement(ctx: Ctx, idx?: number, step?: number) {
    const index = idx ?? ctx.activeIndex
    const range = utils.getRangeAtIndex(ctx, index)
    let value = decrement(range.value, step ?? ctx.step)
    return utils.convert(ctx, value, index)
  },
  increment(ctx: Ctx, idx?: number, step?: number) {
    const index = idx ?? ctx.activeIndex
    const range = utils.getRangeAtIndex(ctx, index)
    let value = increment(range.value, step ?? ctx.step)
    return utils.convert(ctx, value, index)
  },
}
