import { Point, Range } from "@ui-machines/utils"
import { RangeSliderMachineContext } from "./range-slider.machine"

export function getElementIds(uid: string) {
  return {
    getThumbId: (index: number) => `slider-${uid}-thumb-${index}`,
    getInputId: (index: number) => `slider-${uid}-input-${index}`,
    root: `slider-${uid}-root`,
    innerTrack: `slider-${uid}-root`,
  }
}

export function getElements(ctx: RangeSliderMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)

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
  const thumbRanges = Range.valuesToRanges(ctx)
  const range = thumbRanges[activeIndex]
  return range.withOptions({ value: values[activeIndex], step })
}

export function pointToValue(ctx: RangeSliderMachineContext, info: Point) {
  const { root } = getElements(ctx)
  if (!root) return

  const range = getRangeAtIndex(ctx)

  const point = info.relativeToNode(root)

  const max = range.max / ctx.max
  const min = range.min / ctx.max

  const percent = new Range({ min, max, value: point.xPercent }).clamp()

  const opts = {
    min: ctx.min,
    max: ctx.max,
    value: range.value,
    step: ctx.step,
  }

  const value = new Range(opts).fromPercent(percent)
  return new Range(opts).snapToStep(value).valueOf()
}
