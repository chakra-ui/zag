import { StateMachine } from "@ui-machines/core"
import { dispatchInputEvent, queryElements } from "@ui-machines/dom-utils"
import { clamp, multiply, percentToValue, snapToStep, toRanges } from "@ui-machines/number-utils"
import type { Point } from "@ui-machines/rect-utils"
import { closest, getElementRect, relativeToNode } from "@ui-machines/rect-utils"
import { slider } from "@ui-machines/slider"
import type { Style } from "@ui-machines/types"
import type { RangeSliderMachineContext as Ctx } from "./range-slider.types"

export function getRangeAtIndex(ctx: Ctx, index = ctx.activeIndex) {
  const spacing = multiply(ctx.minStepsBetweenThumbs, ctx.step)
  const range = toRanges({ ...ctx, spacing })
  return range[index]
}

function getPointProgress(ctx: Ctx, point: Point) {
  const { progress } = relativeToNode(point, dom.getRootEl(ctx)!)
  let percent = ctx.isHorizontal ? progress.x : progress.y
  if (ctx.isRtl) percent = 1 - percent
  return clamp(percent, { min: 0, max: 1 })
}

function getValueFromPoint(ctx: Ctx, point: Point) {
  const root = dom.getRootEl(ctx)
  if (!root || ctx.activeIndex === -1) return

  const range = getRangeAtIndex(ctx)
  const maxPercent = range.max / ctx.max
  const minPercent = range.min / ctx.max

  let percent = getPointProgress(ctx, point)
  percent = clamp(percent, { min: minPercent, max: maxPercent })

  const value = percentToValue(percent, ctx)
  return parseFloat(snapToStep(value, ctx.step))
}

export function getRangeStyle(ctx: Ctx): Style {
  const { orientation, value: values, max } = ctx
  const startValue = (values[0] / max) * 100
  const endValue = 100 - (values[values.length - 1] / max) * 100

  const style: Style = {
    position: "absolute",
    "--slider-range-start": `${startValue}%`,
    "--slider-range-end": `${endValue}%`,
  }

  if (orientation === "vertical") {
    return {
      ...style,
      bottom: "var(--slider-range-start)",
      top: "var(--slider-range-end)",
    }
  }

  return {
    ...style,
    [ctx.isRtl ? "right" : "left"]: "var(--slider-range-start)",
    [ctx.isRtl ? "left" : "right"]: "var(--slider-range-end)",
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
  dispatchChangeEvent(ctx: Ctx) {
    const value = ctx.value[ctx.activeIndex]
    const input = dom.getInputEl(ctx, ctx.activeIndex)
    if (!input) return
    dispatchInputEvent(input, value)
  },

  getRootStyle: slider["unstable__dom"].getRootStyle,
  getThumbStyle(ctx: Ctx, index: number) {
    const value = ctx.value[index]
    const thumbSize = ctx.thumbSize?.[index] ?? { width: 0, height: 0 }
    return slider["unstable__dom"].getThumbStyle({ ...ctx, value, thumbSize })
  },
  getRangeStyle,
  getTrackStyle: (): Style => ({
    position: "relative",
  }),
}

export function getClosestIndex(ctx: Ctx, evt: StateMachine.AnyEventObject) {
  // evt.index means this was passed on a keyboard event (`onKeyDown`)
  let index = evt.index

  if (index == null) {
    const thumbs = dom.getElements(ctx)

    // get the center point of all thumbs
    const points = thumbs.map((el) => getElementRect(el)).map((rect) => rect.center)

    // get the closest center point from the event ("pointerdown") point
    const getClosest = closest(...points)
    const closestPoint = getClosest(evt.point)
    index = points.indexOf(closestPoint)

    const rootEl = dom.getRootEl(ctx)
    if (!rootEl) return index

    // when two thumbs are stacked and the user clicks at a point larger than
    // their values, pick the next closest thumb
    const percent = getPointProgress(ctx, evt.point)
    const Point = percentToValue(percent, ctx)

    const axisPoints = ctx.isHorizontal ? points.map((p) => p.x) : points.map((p) => p.y)
    const isThumbStacked = new Set(axisPoints).size !== points.length

    if (isThumbStacked && Point > ctx.value[index]) {
      index = clamp(index + 1, { min: 0, max: ctx.value.length - 1 })
    }
  }

  return index
}
