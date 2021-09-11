import { Point } from "@core-graphics/point"
import { NumericRange } from "@core-foundation/numeric-range"
import { RangeSliderMachineContext } from "./range-slider.machine"

export function getIds(uid: string) {
  return {
    getThumbId: (index: number) => `slider-${uid}-thumb-${index}`,
    getInputId: (index: number) => `slider-${uid}-input-${index}`,
    root: `slider-${uid}-root`,
    innerTrack: `slider-${uid}-root`,
  }
}

export function getElements(ctx: RangeSliderMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getIds(ctx.uid)

  const root = doc.getElementById(ids.root)
  const sliders = root?.querySelectorAll(`[role=slider]`)

  return {
    getThumb: (index: number) => doc.getElementById(ids.getThumbId(index)),
    getInput: (index: number) => doc.getElementById(ids.getInputId(index)),
    root: doc.getElementById(ids.root),
    thumbs: Array.from(sliders ?? []) as HTMLElement[],
    innerTrack: doc.getElementById(ids.innerTrack),
  }
}

export function getRangeAtIndex(ctx: RangeSliderMachineContext) {
  const { activeIndex, step, value: values } = ctx
  const ranges = NumericRange.fromValues(ctx.value, ctx)
  const range = ranges[activeIndex]
  return range.withOptions({ value: values[activeIndex], step })
}

export function pointToValue(ctx: RangeSliderMachineContext, info: Point) {
  const { root } = getElements(ctx)
  if (!root) return

  const range = getRangeAtIndex(ctx)
  const max = range.max / ctx.max
  const min = range.min / ctx.max

  const { progress } = info.relativeToNode(root)
  const percent = new NumericRange({ min, max, value: progress.x }).clamp()

  const opts = {
    min: ctx.min,
    max: ctx.max,
    value: range.value,
    step: ctx.step,
  }

  const value = NumericRange.fromPercent(+percent, opts).valueOf()
  return new NumericRange(opts).setValue(value).snapToStep().valueOf()
}
