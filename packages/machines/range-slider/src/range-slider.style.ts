import { unstable__dom as sliderDom } from "@zag-js/slider"
import type { Style } from "@zag-js/types"
import type { MachineContext as Ctx } from "./range-slider.types"

/* -----------------------------------------------------------------------------
 * Range style calculations
 * -----------------------------------------------------------------------------*/

function getBounds<T>(value: T[]): [T, T] {
  const firstValue = value[0]
  const lastThumb = value[value.length - 1]
  return [firstValue, lastThumb]
}

export function getRangeOffsets(ctx: Ctx) {
  const [firstPercent, lastPercent] = getBounds(ctx.valuePercent)
  return { start: `${firstPercent}%`, end: `${100 - lastPercent}%` }
}

/* -----------------------------------------------------------------------------
 * Thumb style calculations
 * -----------------------------------------------------------------------------*/

function getVisibility(ctx: Ctx) {
  let visibility: "visible" | "hidden" = "visible"
  if (ctx.thumbAlignment === "contain" && !ctx.hasMeasuredThumbSize) {
    visibility = "hidden"
  }
  return visibility
}

function getThumbStyle(ctx: Ctx, index: number): Style {
  const placementProp = ctx.isVertical ? "bottom" : "insetInlineStart"
  return {
    visibility: getVisibility(ctx),
    position: "absolute",
    transform: "var(--slider-thumb-transform)",
    [placementProp]: `var(--slider-thumb-offset-${index})`,
  }
}

/* -----------------------------------------------------------------------------
 * Root style calculations
 * -----------------------------------------------------------------------------*/

function getRootStyle(ctx: Ctx): Style {
  const range = getRangeOffsets(ctx)

  const offsetStyles = ctx.value.reduce<Style>((styles, value, index) => {
    const offset = sliderDom.getThumbOffset({ ...ctx, value })
    return { ...styles, [`--slider-thumb-offset-${index}`]: offset }
  }, {})

  return {
    ...offsetStyles,
    "--slider-thumb-transform": ctx.isVertical ? "translateY(50%)" : ctx.isRtl ? "translateX(50%)" : "translateX(-50%)",
    "--slider-range-start": range.start,
    "--slider-range-end": range.end,
  }
}

export const styleGetterFns = {
  getRootStyle,
  getControlStyle: sliderDom.getControlStyle,
  getThumbStyle,
  getRangeStyle: sliderDom.getRangeStyle,
  getMarkerStyle: sliderDom.getMarkerStyle,
  getMarkerGroupStyle: sliderDom.getMarkerGroupStyle,
}
