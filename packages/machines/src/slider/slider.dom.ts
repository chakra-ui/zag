import { clamp, percentToValue, snapToStep, transform, valueToPercent } from "tiny-num"
import type { Point } from "tiny-point"
import { relativeToNode } from "tiny-point/dom"
import type { DOM } from "../utils"
import { dispatchInputEvent } from "../utils"
import type { SliderMachineContext as Ctx } from "./slider.machine"

function getValueFromPoint(ctx: Ctx, point: Point): number | undefined {
  const root = dom.getRootEl(ctx)
  if (!root) return
  const { progress } = relativeToNode(point, root)
  let v = ctx.isHorizontal ? progress.x : progress.y
  if (ctx.isRtl) v = 1 - v
  const percent = clamp(v, { min: 0, max: 1 })
  return parseFloat(snapToStep(percentToValue(percent, ctx), ctx.step))
}

type GetThumbStyleOptions = Pick<
  Ctx,
  "min" | "max" | "dir" | "thumbSize" | "value" | "orientation" | "isHorizontal" | "isVertical" | "step" | "isRtl"
>

function getThumbStyle(ctx: GetThumbStyleOptions): DOM.Style {
  const percent = valueToPercent(ctx.value, ctx)
  const { width: w, height: h } = ctx.thumbSize

  const style: DOM.Style = {
    position: "absolute",
    transform: "var(--slider-thumb-transform)",
  }

  if (ctx.isVertical) {
    const getValue = transform([ctx.min, ctx.max], [-h / 2, h / 2])
    const y = parseFloat(getValue(ctx.value).toFixed(2))
    style.bottom = `calc(${percent}% - ${y}px)`
    return style
  }

  const getValue = ctx.isRtl
    ? transform([ctx.max, ctx.min], [-w * 1.5, -w / 2])
    : transform([ctx.min, ctx.max], [-w / 2, w / 2])

  let x = parseFloat(getValue(ctx.value).toFixed(2))
  x = ctx.isRtl ? -x : x
  style[ctx.isRtl ? "right" : "left"] = `calc(${percent}% - ${x}px)`
  return style
}

function getRangeStyle(ctx: Ctx): DOM.Style {
  const percent = valueToPercent(ctx.value, ctx)

  const style: DOM.Style = {
    position: "absolute",
  }

  let startValue = "0%"
  let endValue = `${100 - percent}%`

  if (ctx.origin === "center") {
    const isNegative = percent < 50
    startValue = isNegative ? `${percent}%` : "50%"
    endValue = isNegative ? "50%" : endValue
  }

  if (ctx.isVertical) {
    return {
      ...style,
      bottom: startValue,
      top: endValue,
    }
  }

  return {
    ...style,
    [ctx.isRtl ? "right" : "left"]: startValue,
    [ctx.isRtl ? "left" : "right"]: endValue,
  }
}

function getRootStyle(ctx: Pick<Ctx, "isVertical">): DOM.Style {
  return {
    touchAction: "none",
    userSelect: "none",
    "--slider-thumb-transform": ctx.isVertical ? "translateY(50%)" : "translateX(-50%)",
    position: "relative",
  }
}

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getThumbId: (ctx: Ctx) => `slider-thumb-${ctx.uid}`,
  getRootId: (ctx: Ctx) => `slider-root-${ctx.uid}`,
  getInputId: (ctx: Ctx) => `slider-input-${ctx.uid}`,
  getOutputId: (ctx: Ctx) => `slider-output-${ctx.uid}`,
  getTrackId: (ctx: Ctx) => `slider-track-${ctx.uid}`,
  getRangeId: (ctx: Ctx) => `slider-range-${ctx.uid}`,
  getLabelId: (ctx: Ctx) => `slider-label-${ctx.uid}`,

  getThumbEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getThumbId(ctx)),
  getRootEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getRootId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)),

  getRootStyle,
  getThumbStyle,
  getRangeStyle,
  getTrackStyle: (): DOM.Style => ({
    position: "relative",
  }),

  getValueFromPoint,
  dispatchChangeEvent: (ctx: Ctx) => {
    const input = dom.getInputEl(ctx)
    if (input) dispatchInputEvent(input, ctx.value)
  },
}
