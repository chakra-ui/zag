import { queryElements } from "tiny-nodelist"
import { clamp, percentToValue, snapToStep, toRanges } from "tiny-num"
import type { Point } from "tiny-point"
import { relativeToNode } from "tiny-point/dom"
import { dom as sliderDom } from "../../src/slider/slider.dom"
import { dispatchInputEvent } from "../utils/dispatch-input"
import type { DOM } from "../utils/types"
import type { RangeSliderMachineContext as Ctx } from "./range-slider.machine"

export const getRangeAtIndex = (ctx: Ctx) => toRanges(ctx)[ctx.activeIndex]

function getValueFromPoint(ctx: Ctx, point: Point) {
  const root = dom.getRootEl(ctx)
  if (!root) return
  const range = getRangeAtIndex(ctx)
  const max = range.max / ctx.max
  const min = range.min / ctx.max

  const { progress } = relativeToNode(point, root)
  let v = ctx.isHorizontal ? progress.x : progress.y
  if (ctx.isRtl) v = 1 - v

  let percent = clamp(v, { min, max })
  const value = percentToValue(percent, ctx)
  return parseFloat(snapToStep(value, ctx.step))
}

export function getRangeStyle(ctx: Ctx): DOM.Style {
  const { orientation, value: values, max } = ctx
  const startValue = (values[0] / max) * 100
  const endValue = 100 - (values[values.length - 1] / max) * 100
  const style: DOM.Style = {
    position: "absolute",
  }
  if (orientation === "vertical") {
    return { ...style, bottom: `${startValue}%`, top: `${endValue}%` }
  }
  return {
    ...style,
    [ctx.isRtl ? "right" : "left"]: `${startValue}%`,
    [ctx.isRtl ? "left" : "right"]: `${endValue}%`,
  }
}

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getThumbId: (ctx: Ctx, index: number) => `slider-thumb-${ctx.uid}-${index}`,
  getInputId: (ctx: Ctx, index: number) => `slider-input-${ctx.uid}-${index}`,
  getRootId: (ctx: Ctx) => `slider-root-${ctx.uid}`,
  getTrackId: (ctx: Ctx) => `slider-track-${ctx.uid}`,
  getRangeId: (ctx: Ctx) => `slider-range-${ctx.uid}`,
  getLabelId: (ctx: Ctx) => `slider-label-${ctx.uid}`,
  getOutputId: (ctx: Ctx) => `slider-output-${ctx.uid}`,

  getThumbEl: (ctx: Ctx, index: number) => dom.getDoc(ctx).getElementById(dom.getThumbId(ctx, index)),
  getInputEl: (ctx: Ctx, index: number) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx, index)),
  getRootEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getRootId(ctx)),
  getElements: (ctx: Ctx) => queryElements(dom.getRootEl(ctx), "[role=slider]"),
  getFirstEl: (ctx: Ctx) => dom.getElements(ctx)[0],
  getRangeEl: (ctx: Ctx) => dom.getDoc(ctx)?.getElementById(dom.getRangeId(ctx)),

  getValueFromPoint,
  dispatchChangeEvent: (ctx: Ctx) => {
    const value = ctx.value[ctx.activeIndex]
    const input = dom.getInputEl(ctx, ctx.activeIndex)
    if (!input) return
    dispatchInputEvent(input, value)
  },

  getRootStyle: sliderDom.getRootStyle,
  getThumbStyle: (ctx: Ctx, index: number) => {
    const value = ctx.value[index]
    const thumbSize = ctx.thumbSize?.[index] ?? { width: 0, height: 0 }
    return sliderDom.getThumbStyle({ ...ctx, value, thumbSize })
  },
  getRangeStyle,
  getTrackStyle: (): DOM.Style => ({
    position: "relative",
  }),
}
