import { StateMachine } from "@zag-js/core"
import { dispatchInputEvent, queryAll } from "@zag-js/dom-utils"
import { clamp, percentToValue, snapToStep, toRanges } from "@zag-js/number-utils"
import type { Point } from "@zag-js/rect-utils"
import { closest, getElementRect, relativeToNode } from "@zag-js/rect-utils"
import { unstable__dom } from "@zag-js/slider"
import type { Style } from "@zag-js/types"
import type { MachineContext as Ctx } from "./range-slider.types"

export function getRangeAtIndex(ctx: Ctx, index = ctx.activeIndex) {
  return toRanges(ctx)[index]
}

function getPointProgress(ctx: Ctx, point: Point) {
  const { progress } = relativeToNode(point, dom.getControlEl(ctx)!)
  let percent: number

  if (ctx.isHorizontal) {
    percent = ctx.isRtl ? 1 - progress.x : progress.x
  } else {
    percent = 1 - progress.y
  }

  return clamp(percent, { min: 0, max: 1 })
}

function getValueFromPoint(ctx: Ctx, point: Point) {
  const control = dom.getControlEl(ctx)
  if (!control || ctx.activeIndex === -1) return

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

  getRootId: (ctx: Ctx) => `slider-${ctx.uid}`,
  getThumbId: (ctx: Ctx, index: number) => `slider-thumb-${ctx.uid}-${index}`,
  getInputId: (ctx: Ctx, index: number) => `slider-input-${ctx.uid}-${index}`,
  getControlId: (ctx: Ctx) => `slider-${ctx.uid}-root`,
  getTrackId: (ctx: Ctx) => `slider-${ctx.uid}-track`,
  getRangeId: (ctx: Ctx) => `slider-${ctx.uid}-range`,
  getLabelId: (ctx: Ctx) => `slider-${ctx.uid}-label`,
  getOutputId: (ctx: Ctx) => `slider-${ctx.uid}-output`,
  getMarkerId: (ctx: Ctx, value: number) => `slider-marker-${ctx.uid}-${value}`,

  getThumbEl: (ctx: Ctx, index: number) => dom.getDoc(ctx).getElementById(dom.getThumbId(ctx, index)),
  getInputEl: (ctx: Ctx, index: number) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx, index)),
  getControlEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getControlId(ctx)),
  getElements: (ctx: Ctx) => queryAll(dom.getControlEl(ctx), "[role=slider]"),
  getFirstEl: (ctx: Ctx) => dom.getElements(ctx)[0],
  getRangeEl: (ctx: Ctx) => dom.getDoc(ctx)?.getElementById(dom.getRangeId(ctx)),

  getValueFromPoint,
  dispatchChangeEvent(ctx: Ctx) {
    const value = ctx.value[ctx.activeIndex]
    const input = dom.getInputEl(ctx, ctx.activeIndex)
    if (!input) return
    dispatchInputEvent(input, value)
  },

  getControlStyle: unstable__dom.getControlStyle,
  getThumbStyle(ctx: Ctx, index: number) {
    const value = ctx.value[index]
    const thumbSize = ctx.thumbSize?.[index] ?? { width: 0, height: 0 }
    return unstable__dom.getThumbStyle({ ...ctx, value, thumbSize })
  },
  getRangeStyle,
  getTrackStyle: (): Style => ({
    position: "relative",
  }),
  getMarkerStyle(ctx: Ctx, percent: number): Style {
    const style: Style = {
      position: "absolute",
      pointerEvents: "none",
    }

    if (ctx.isHorizontal) {
      percent = ctx.isRtl ? 100 - percent : percent
      style.left = `${percent}%`
    } else {
      style.bottom = `${percent}%`
    }

    return style
  },
}

export function getClosestIndex(ctx: Ctx, evt: StateMachine.AnyEventObject) {
  let index: number

  // get the center point of all thumbs
  const thumbs = dom.getElements(ctx)
  const points = thumbs.map((el) => getElementRect(el)).map((rect) => rect.center)

  // get the closest center point from the event ("pointerdown") point
  const getClosest = closest(...points)
  const closestPoint = getClosest(evt.point)
  index = points.indexOf(closestPoint)

  const control = dom.getControlEl(ctx)
  if (!control) return index

  // when two thumbs are stacked and the user clicks at a point larger than
  // their values, pick the next closest thumb
  const percent = getPointProgress(ctx, evt.point)
  const point = percentToValue(percent, ctx)

  const axisPoints = ctx.isHorizontal ? points.map((p) => p.x) : points.map((p) => p.y)
  const isThumbStacked = new Set(axisPoints).size !== points.length

  if (isThumbStacked && point > ctx.value[index]) {
    index = clamp(index + 1, { min: 0, max: ctx.value.length - 1 })
  }

  return index
}
