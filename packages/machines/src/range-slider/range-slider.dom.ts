import { StateMachine } from "@ui-machines/core"
import { queryElements } from "tiny-nodelist"
import type { Point } from "tiny-point"
import { closest } from "tiny-point/distance"
import { relativeToNode } from "tiny-point/dom"
import { center } from "tiny-rect"
import { fromElement } from "tiny-rect/from-element"
import { dom as sliderDom } from "../../src/slider/slider.dom"
import { dispatchInputEvent } from "../utils/dispatch-input"
import { clamp, multiply, percentToValue, snapToStep, toRanges } from "../utils/number"
import type { DOM } from "../utils/types"
import type { RangeSliderMachineContext as Ctx } from "./range-slider.types"

export const getRangeAtIndex = (ctx: Ctx) => {
  const spacing = multiply(ctx.minStepsBetweenThumbs, ctx.step)
  const range = toRanges({ ...ctx, spacing })
  return range[ctx.activeIndex]
}

function getValueFromPoint(ctx: Ctx, point: Point) {
  const root = dom.getRootEl(ctx)
  if (!root || ctx.activeIndex === -1) return
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

export function getClosestIndex(ctx: Ctx, evt: StateMachine.AnyEventObject) {
  // evt.index means this was passed on a keyboard event (`onKeyDown`)
  let index = evt.index

  if (index == null) {
    const thumbs = dom.getElements(ctx)

    // get the center point of all thumbs
    const points = thumbs.map((el) => fromElement(el)).map((rect) => center(rect))

    // get the closest center point from the event ("pointerdown") point
    const getClosest = closest(...points)
    const closestPoint = getClosest(evt.point)
    index = points.indexOf(closestPoint)

    // when two thumbs are stacked and the user clicks at a point larger than
    // their values, pick the next closest thumb
    const rootEl = dom.getRootEl(ctx)

    if (!rootEl) return index

    // in event two thumbs are stacked and the user clicks at a point on the track
    // we need to pick the closest thumb
    const { progress } = relativeToNode(evt.point, rootEl)
    let percent = ctx.isHorizontal ? progress.x : progress.y
    if (ctx.isRtl) percent = 1 - percent
    const pointValue = percentToValue(percent, ctx)
    const pts = ctx.isHorizontal ? points.map((p) => p.x) : points.map((p) => p.y)

    const isThumbStacked = new Set(pts).size !== points.length

    if (isThumbStacked && pointValue > ctx.value[index]) {
      index++
    }
  }

  return index
}
