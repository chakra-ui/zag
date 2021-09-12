import { NumericRange } from "@core-foundation/numeric-range"
import type { Point } from "@core-graphics/point"
import type { CSSStyleProperties } from "../utils/types"
import type { SliderMachineContext } from "./slider.machine"

export function getIds(id: string) {
  return {
    thumb: `slider-thumb-${id}`,
    root: `slider-root-${id}`,
    input: `slider-input-${id}`,
    output: `slider-output-${id}`,
    track: `slider-track-${id}`,
    range: `slider-range-${id}`,
    label: `slider-label-${id}`,
  }
}

export function getElements(ctx: SliderMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getIds(ctx.uid)
  return {
    doc,
    thumb: doc.getElementById(ids.thumb),
    root: doc.getElementById(ids.root),
    input: doc.getElementById(ids.input),
  }
}

export function getValueFromPoint(ctx: SliderMachineContext, info: Point): number | undefined {
  const { root } = getElements(ctx)
  if (!root) return

  const isHorizontal = ctx.orientation === "horizontal"
  const isRtl = isHorizontal && ctx.dir === "rtl"

  const { progress } = info.relativeToNode(root)
  let progressValue = isHorizontal ? progress.x : progress.y

  if (isRtl) progressValue = 1 - progressValue

  const opts = { min: 0, max: 1, value: progressValue }
  const percent = new NumericRange(opts).clamp().valueOf()

  const range = NumericRange.fromPercent(percent, ctx)

  return range.clone().snapToStep().valueOf()
}

type GetThumbStyleOptions = Pick<SliderMachineContext, "min" | "max" | "dir" | "thumbSize" | "value" | "orientation">

export function getThumbStyle(ctx: GetThumbStyleOptions): CSSStyleProperties {
  const range = new NumericRange(ctx)
  const percent = range.toPercent()

  const isRtl = ctx.dir === "rtl"
  const { width: w, height: h } = ctx.thumbSize ?? { width: 0, height: 0 }

  const style: CSSStyleProperties = {
    position: "absolute",
    transform: "var(--slider-thumb-transform)",
  }

  if (ctx.orientation === "vertical") {
    const getValue = NumericRange.transform([ctx.min, ctx.max], [-h / 2, h / 2])
    const y = +getValue(ctx.value).toFixed(2)
    return {
      ...style,
      bottom: `calc(${percent}% - ${y}px)`,
    }
  }

  const getValue = isRtl
    ? NumericRange.transform([ctx.max, ctx.min], [-w * 1.5, -w / 2])
    : NumericRange.transform([ctx.min, ctx.max], [-w / 2, w / 2])

  let x = +getValue(ctx.value).toFixed(2)
  x = isRtl ? -x : x

  return {
    ...style,
    [isRtl ? "right" : "left"]: `calc(${percent}% - ${x}px)`,
  }
}

export function getRangeStyle(ctx: SliderMachineContext): CSSStyleProperties {
  const range = new NumericRange(ctx)
  const percent = range.toPercent()
  const isRtl = ctx.dir === "rtl"

  const style: CSSStyleProperties = {
    position: "absolute",
  }

  let startValue = "0%"
  let endValue = `${100 - percent}%`

  if (ctx.origin === "center") {
    const isNegative = percent < 50
    startValue = isNegative ? `${percent}%` : "50%"
    endValue = isNegative ? "50%" : endValue
  }

  if (ctx.orientation === "vertical") {
    return {
      ...style,
      bottom: startValue,
      top: endValue,
    }
  }

  return {
    ...style,
    [isRtl ? "right" : "left"]: startValue,
    [isRtl ? "left" : "right"]: endValue,
  }
}

export function getRootStyle(ctx: Pick<SliderMachineContext, "orientation">): CSSStyleProperties {
  const isVertical = ctx.orientation === "vertical"
  return {
    touchAction: "none",
    userSelect: "none",
    "--slider-thumb-transform": isVertical ? "translateY(50%)" : "translateX(-50%)",
    position: "relative",
  }
}

export function getStyles(ctx: SliderMachineContext) {
  const trackStyle: CSSStyleProperties = {
    position: "relative",
  }

  return {
    root: getRootStyle(ctx),
    thumb: getThumbStyle(ctx),
    range: getRangeStyle(ctx),
    track: trackStyle,
  }
}
