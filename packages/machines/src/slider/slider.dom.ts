import { NumericRange } from "@core-foundation/numeric-range"
import { Point } from "@core-graphics/point"
import { CSSStyleProperties } from "../utils/types"
import type { SliderMachineContext } from "./slider.machine"

export function getElementIds(id: string) {
  return {
    thumb: `slider-${id}-thumb`,
    root: `slider-${id}-root`,
    input: `slider-${id}-input`,
    track: `slider-${id}-track`,
    innerTrack: `slider-${id}-inner-track`,
  }
}

export function getElements(ctx: SliderMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)
  return {
    doc,
    thumb: doc.getElementById(ids.thumb),
    root: doc.getElementById(ids.root),
    input: doc.getElementById(ids.input),
  }
}

export function getValueFromPoint(ctx: SliderMachineContext, info: Point) {
  const { root } = getElements(ctx)
  if (!root) return

  const isHorizontal = ctx.orientation === "horizontal"
  const isRtl = ctx.dir === "rtl"

  const { progress } = info.relativeToNode(root)
  const progressValue = isHorizontal ? progress.x : progress.y

  const opts = { min: 0, max: 1, value: progressValue }

  let percent = new NumericRange(opts).clamp().valueOf()

  if (isHorizontal && isRtl) {
    percent = 1 - percent
  }

  const range = NumericRange.fromPercent(percent, ctx)

  return range.clone().snapToStep().valueOf()
}

export function getThumbPlacementStyle(ctx: SliderMachineContext) {
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

export function getInnerTrackPlacementStyle(ctx: SliderMachineContext) {
  const range = new NumericRange(ctx)
  const percent = range.toPercent()
  const isRtl = ctx.dir === "rtl"

  const style: CSSStyleProperties = {
    position: "absolute",
  }

  if (ctx.orientation === "vertical") {
    return {
      ...style,
      bottom: "0%",
      top: `${100 - percent}%`,
    }
  }

  return {
    ...style,
    [isRtl ? "right" : "left"]: "0%",
    [isRtl ? "left" : "right"]: `${100 - percent}%`,
  }
}
