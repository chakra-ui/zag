import { dispatchInputValueEvent } from "@zag-js/dom-utils"
import { transform, valueToPercent } from "@zag-js/number-utils"
import type { Point } from "@zag-js/rect-utils"
import { relativeToNode } from "@zag-js/rect-utils"
import type { Style } from "@zag-js/types"
import type { MachineContext as Ctx, SharedContext } from "./slider.types"
import { utils } from "./slider.utils"

/**
 * To ensure the slider thumb is always within the track (on the y-axis)
 */
function getVerticalThumbOffset(ctx: SharedContext) {
  const { height = 0 } = ctx.thumbSize ?? {}
  const getValue = transform([ctx.min, ctx.max], [-height / 2, height / 2])
  return parseFloat(getValue(ctx.value).toFixed(2))
}

/**
 * To ensure the slider thumb is always within the track (on the x-axis)
 */
function getHorizontalThumbOffset(ctx: SharedContext) {
  const { width = 0 } = ctx.thumbSize ?? {}

  if (ctx.isRtl) {
    const getValue = transform([ctx.max, ctx.min], [-width * 1.5, -width / 2])
    return -1 * parseFloat(getValue(ctx.value).toFixed(2))
  }

  const getValue = transform([ctx.min, ctx.max], [-width / 2, width / 2])
  return parseFloat(getValue(ctx.value).toFixed(2))
}

function getThumbStyle(ctx: SharedContext): Style {
  const percent = valueToPercent(ctx.value, ctx)
  const offset = ctx.isVertical ? getVerticalThumbOffset(ctx) : getHorizontalThumbOffset(ctx)

  const style: Style = {
    visibility: ctx.hasMeasuredThumbSize ? "visible" : "hidden",
    position: "absolute",
    transform: "var(--slider-thumb-transform)",
    "--slider-thumb-placement": `calc(${percent}% - ${offset}px)`,
  }

  if (ctx.isVertical) {
    style.bottom = "var(--slider-thumb-placement)"
  } else {
    style[ctx.isRtl ? "right" : "left"] = "var(--slider-thumb-placement)"
  }

  return style
}

function getRangeStyle(ctx: Ctx): Style {
  const percent = valueToPercent(ctx.value, ctx)

  const style: Style = {
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

function getControlStyle(ctx: Pick<Ctx, "isVertical">): Style {
  return {
    touchAction: "none",
    userSelect: "none",
    "--slider-thumb-transform": ctx.isVertical ? "translateY(50%)" : "translateX(-50%)",
    position: "relative",
  }
}

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootNode: (ctx: Ctx) => ctx.rootNode ?? dom.getDoc(ctx),

  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `slider:${ctx.uid}`,
  getThumbId: (ctx: Ctx) => ctx.ids?.thumb ?? `slider:${ctx.uid}:thumb`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `slider:${ctx.uid}:control`,
  getInputId: (ctx: Ctx) => `slider:${ctx.uid}:input`,
  getOutputId: (ctx: Ctx) => ctx.ids?.output ?? `slider:${ctx.uid}:output`,
  getTrackId: (ctx: Ctx) => ctx.ids?.track ?? `slider:-${ctx.uid}track`,
  getRangeId: (ctx: Ctx) => ctx.ids?.track ?? `slider:${ctx.uid}:range`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `slider:${ctx.uid}:label`,
  getMarkerId: (ctx: Ctx, value: number) => `slider:${ctx.uid}:marker:${value}`,

  getRootEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getRootId(ctx)),
  getThumbEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getThumbId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getControlId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputElement | null,

  getControlStyle,
  getThumbStyle,
  getRangeStyle,

  getValueFromPoint(ctx: Ctx, point: Point): number | undefined {
    // get the slider root element
    const control = dom.getControlEl(ctx)
    if (!control) return

    // get the position/progress % of the point relative to the root's width/height
    const { progress } = relativeToNode(point, control)

    // get the progress % depending on the orientation
    let percent: number

    if (ctx.isHorizontal) {
      percent = ctx.isRtl ? 1 - progress.x : progress.x
    } else {
      percent = 1 - progress.y
    }

    return utils.fromPercent(ctx, percent)
  },

  dispatchChangeEvent(ctx: Ctx) {
    const input = dom.getInputEl(ctx)
    if (!input) return
    dispatchInputValueEvent(input, ctx.value)
  },

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
