import { getValuePercent, getValueTransformer } from "@zag-js/numeric-range"
import type { Style } from "@zag-js/types"
import type { MachineContext as Ctx, SharedContext } from "./slider.types"

/* -----------------------------------------------------------------------------
 * Thumb style calculations
 * -----------------------------------------------------------------------------*/

function getVerticalThumbOffset(ctx: SharedContext) {
  const { height = 0 } = ctx.thumbSize ?? {}
  const getValue = getValueTransformer([ctx.min, ctx.max], [-height / 2, height / 2])
  return parseFloat(getValue(ctx.value).toFixed(2))
}

function getHorizontalThumbOffset(ctx: SharedContext) {
  const { width = 0 } = ctx.thumbSize ?? {}

  if (ctx.isRtl) {
    const getValue = getValueTransformer([ctx.max, ctx.min], [-width * 1.5, -width / 2])
    return -1 * parseFloat(getValue(ctx.value).toFixed(2))
  }

  const getValue = getValueTransformer([ctx.min, ctx.max], [-width / 2, width / 2])
  return parseFloat(getValue(ctx.value).toFixed(2))
}

function getThumbOffset(ctx: SharedContext) {
  const percent = getValuePercent(ctx.value, ctx.min, ctx.max) * 100

  if (ctx.thumbAlignment === "center") {
    return `${percent}%`
  }

  const offset = ctx.isVertical ? getVerticalThumbOffset(ctx) : getHorizontalThumbOffset(ctx)
  return `calc(${percent}% - ${offset}px)`
}

function getVisibility(ctx: SharedContext) {
  let visibility: "visible" | "hidden" = "visible"
  if (ctx.thumbAlignment === "contain" && !ctx.hasMeasuredThumbSize) {
    visibility = "hidden"
  }
  return visibility
}

function getThumbStyle(ctx: SharedContext): Style {
  const placementProp = ctx.isVertical ? "bottom" : ctx.isRtl ? "right" : "left"
  return {
    visibility: getVisibility(ctx),
    position: "absolute",
    transform: "var(--slider-thumb-transform)",
    [placementProp]: "var(--slider-thumb-offset)",
  }
}

/* -----------------------------------------------------------------------------
 * Range style calculations
 * -----------------------------------------------------------------------------*/

function getRangeOffsets(ctx: Ctx) {
  let start = "0%"
  let end = `${100 - ctx.valuePercent}%`

  if (ctx.origin === "center") {
    const isNegative = ctx.valuePercent < 50
    start = isNegative ? `${ctx.valuePercent}%` : "50%"
    end = isNegative ? "50%" : end
  }

  return { start, end }
}

function getRangeStyle(ctx: Pick<SharedContext, "isVertical" | "isRtl">): Style {
  if (ctx.isVertical) {
    return {
      position: "absolute",
      bottom: "var(--slider-range-start)",
      top: "var(--slider-range-end)",
    }
  }

  return {
    position: "absolute",
    [ctx.isRtl ? "right" : "left"]: "var(--slider-range-start)",
    [ctx.isRtl ? "left" : "right"]: "var(--slider-range-end)",
  }
}

/* -----------------------------------------------------------------------------
 * Control style calculations
 * -----------------------------------------------------------------------------*/

function getControlStyle(): Style {
  return {
    touchAction: "none",
    userSelect: "none",
    position: "relative",
  }
}

/* -----------------------------------------------------------------------------
 * Root style calculations
 * -----------------------------------------------------------------------------*/

function getRootStyle(ctx: Ctx): Style {
  const range = getRangeOffsets(ctx)
  return {
    "--slider-thumb-transform": ctx.isVertical ? "translateY(50%)" : "translateX(-50%)",
    "--slider-thumb-offset": getThumbOffset(ctx),
    "--slider-range-start": range.start,
    "--slider-range-end": range.end,
  }
}

/* -----------------------------------------------------------------------------
 * Marker style calculations
 * -----------------------------------------------------------------------------*/

function getMarkerStyle(ctx: Pick<SharedContext, "isHorizontal" | "isRtl">, percent: number): Style {
  return {
    position: "absolute",
    pointerEvents: "none",
    [ctx.isHorizontal ? "left" : "bottom"]: `${(ctx.isRtl ? 1 - percent : percent) * 100}%`,
  }
}

/* -----------------------------------------------------------------------------
 * Label style calculations
 * -----------------------------------------------------------------------------*/

function getLabelStyle(): Style {
  return { userSelect: "none" }
}

/* -----------------------------------------------------------------------------
 * Label style calculations
 * -----------------------------------------------------------------------------*/

function getTrackStyle(): Style {
  return { position: "relative" }
}

/* -----------------------------------------------------------------------------
 * Label style calculations
 * -----------------------------------------------------------------------------*/

function getMarkerGroupStyle(): Style {
  return {
    userSelect: "none",
    pointerEvents: "none",
    position: "relative",
  }
}

export const styles = {
  getThumbOffset,
  getControlStyle,
  getThumbStyle,
  getRangeStyle,
  getRootStyle,
  getMarkerStyle,
  getLabelStyle,
  getTrackStyle,
  getMarkerGroupStyle,
}
