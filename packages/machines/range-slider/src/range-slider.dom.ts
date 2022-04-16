import { StateMachine } from "@zag-js/core"
import { dispatchInputValueEvent, queryAll } from "@zag-js/dom-utils"
import { clamp, percentToValue } from "@zag-js/number-utils"
import type { Point } from "@zag-js/rect-utils"
import { closest, getElementRect, relativeToNode } from "@zag-js/rect-utils"
import { unstable__dom } from "@zag-js/slider"
import type { Style } from "@zag-js/types"
import type { MachineContext as Ctx } from "./range-slider.types"
import { utils } from "./range-slider.utils"

function getPointProgress(ctx: Ctx, point: Point) {
  const { progress } = relativeToNode(point, dom.getControlEl(ctx)!)
  let percent: number

  if (ctx.isHorizontal) {
    percent = ctx.isRtl ? 1 - progress.x : progress.x
  } else {
    percent = 1 - progress.y
  }

  return utils.clampPercent(percent)
}

function getValueFromPoint(ctx: Ctx, point: Point) {
  if (ctx.activeIndex === -1) return
  let percent = getPointProgress(ctx, point)
  return utils.fromPercent(ctx, percent)
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

  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `slider:${ctx.uid}`,
  getThumbId: (ctx: Ctx, index: number) => ctx.ids?.thumb?.(index) ?? `slider:${ctx.uid}:thumb:${index}`,
  getInputId: (ctx: Ctx, index: number) => `slider:${ctx.uid}:input:${index}`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `slider:${ctx.uid}:control`,
  getTrackId: (ctx: Ctx) => ctx.ids?.track ?? `slider:${ctx.uid}:track`,
  getRangeId: (ctx: Ctx) => ctx.ids?.range ?? `slider:${ctx.uid}:range`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `slider:${ctx.uid}:label`,
  getOutputId: (ctx: Ctx) => ctx.ids?.output ?? `slider:${ctx.uid}:output`,
  getMarkerId: (ctx: Ctx, value: number) => `slider-${ctx.uid}:marker:${value}`,

  getThumbEl: (ctx: Ctx, index: number) => dom.getDoc(ctx).getElementById(dom.getThumbId(ctx, index)),
  getInputEl: (ctx: Ctx, index: number) =>
    dom.getDoc(ctx).getElementById(dom.getInputId(ctx, index)) as HTMLInputElement | null,
  getControlEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getControlId(ctx)),
  getElements: (ctx: Ctx) => queryAll(dom.getControlEl(ctx), "[role=slider]"),
  getFirstEl: (ctx: Ctx) => dom.getElements(ctx)[0],
  getRangeEl: (ctx: Ctx) => dom.getDoc(ctx)?.getElementById(dom.getRangeId(ctx)),

  getValueFromPoint,
  dispatchChangeEvent(ctx: Ctx) {
    const _values = Array.from(ctx.value)
    _values.forEach((value, index) => {
      const input = dom.getInputEl(ctx, index)
      if (!input) return
      dispatchInputValueEvent(input, value)
    })
  },

  getControlStyle: unstable__dom.getControlStyle,
  getThumbStyle(ctx: Ctx, index: number) {
    const value = ctx.value[index]
    const thumbSize = ctx.thumbSize?.[index] ?? { width: 0, height: 0 }
    return unstable__dom.getThumbStyle({ ...ctx, value, thumbSize })
  },
  getRangeStyle,
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

  // prettier-ignore
  const axisPoints = ctx.isHorizontal ? 
    points.map((p) => p.x) :
    points.map((p) => p.y)

  const isThumbStacked = new Set(axisPoints).size !== points.length

  if (isThumbStacked && point > ctx.value[index]) {
    index = clamp(index + 1, { min: 0, max: ctx.value.length - 1 })
  }

  return index
}
