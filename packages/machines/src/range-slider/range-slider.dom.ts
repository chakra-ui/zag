import { NumericRange } from "@core-foundation/numeric-range"
import { Point } from "@core-graphics/point"
import { getRootStyle, getThumbStyle } from "../slider/slider.dom"
import { CSSStyleProperties } from "../utils/types"
import { RangeSliderMachineContext } from "./range-slider.machine"

export function getIds(id: string) {
  return {
    getThumbId: (index: number) => `slider-${id}-thumb-${index}`,
    getInputId: (index: number) => `slider-${id}-input-${index}`,
    root: `slider-${id}-root`,
    track: `slider-${id}-track`,
    range: `slider-${id}-range`,
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
    range: doc.getElementById(ids.range),
  }
}

export function getRangeAtIndex(ctx: RangeSliderMachineContext) {
  const { activeIndex, step, value: values } = ctx
  const ranges = NumericRange.fromValues(ctx.value, ctx)
  const range = ranges[activeIndex]
  return range.withOptions({ value: values[activeIndex], step })
}

export function getValueFromPoint(ctx: RangeSliderMachineContext, info: Point) {
  const { root } = getElements(ctx)
  if (!root) return

  const isHorizontal = ctx.orientation === "horizontal"
  const isRtl = ctx.dir === "rtl" && isHorizontal

  const range = getRangeAtIndex(ctx)

  const max = range.max / ctx.max
  const min = range.min / ctx.max

  const { progress } = info.relativeToNode(root)
  let progressValue = isHorizontal ? progress.x : progress.y

  if (isRtl) progressValue = 1 - progressValue
  let percent = new NumericRange({ min, max, value: progressValue }).clamp().valueOf()

  const opts = {
    min: ctx.min,
    max: ctx.max,
    value: range.value,
    step: ctx.step,
  }

  const value = NumericRange.fromPercent(+percent, opts).valueOf()
  return new NumericRange(opts).setValue(value).snapToStep().valueOf()
}

export function getRangeStyle(ctx: RangeSliderMachineContext): CSSStyleProperties {
  const { orientation, dir, value: values, max } = ctx
  const isRtl = dir === "rtl"

  const startValue = (values[0] / max) * 100
  const endValue = 100 - (values[values.length - 1] / max) * 100

  const style: CSSStyleProperties = {
    position: "absolute",
  }

  if (orientation === "vertical") {
    return {
      ...style,
      bottom: `${startValue}%`,
      top: `${endValue}%`,
    }
  }

  return {
    ...style,
    [isRtl ? "right" : "left"]: `${startValue}%`,
    [isRtl ? "left" : "right"]: `${endValue}%`,
  }
}

export function getStyles(ctx: RangeSliderMachineContext) {
  const trackStyle: CSSStyleProperties = {
    position: "relative",
  }

  return {
    root: getRootStyle(ctx),
    getThumb(index: number) {
      const value = ctx.value[index]
      const thumbSize = ctx.thumbSize?.[index] ?? { width: 0, height: 0 }
      return getThumbStyle({ ...ctx, value, thumbSize })
    },
    range: getRangeStyle(ctx),
    track: trackStyle,
  }
}
