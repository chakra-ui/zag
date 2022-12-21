import { unstable__dom as sliderDom } from "@zag-js/slider"
import type { Style } from "@zag-js/types"
import type { MachineContext as Ctx } from "./range-slider.types"

/* -----------------------------------------------------------------------------
 * Range style calculations
 * -----------------------------------------------------------------------------*/

export function getRangeOffsets(ctx: Ctx) {
  let start = ((ctx.value[0] - ctx.min) / (ctx.max - ctx.min)) * 100
  let end = 100 - (ctx.value[ctx.value.length - 1] / ctx.max) * 100
  return { start: `${start}%`, end: `${end}%` }
}

/* -----------------------------------------------------------------------------
 * Thumb style calculations
 * -----------------------------------------------------------------------------*/

function getThumbStyle(ctx: Ctx, index: number): Style {
  const placementProp = ctx.isVertical ? "bottom" : ctx.isRtl ? "right" : "left"
  return {
    visibility: ctx.hasMeasuredThumbSize ? "visible" : "hidden",
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
    const thumbSize = ctx.thumbSizes[index] ?? { width: 0, height: 0 }
    const offset = sliderDom.getThumbOffset({ ...ctx, value, thumbSize })
    return { ...styles, [`--slider-thumb-offset-${index}`]: offset }
  }, {})

  return {
    ...offsetStyles,
    "--slider-thumb-transform": ctx.isVertical ? "translateY(50%)" : "translateX(-50%)",
    "--slider-range-start": range.start,
    "--slider-range-end": range.end,
  }
}

export const styles = {
  getRootStyle,
  getControlStyle: sliderDom.getControlStyle,
  getThumbStyle,
  getRangeStyle: sliderDom.getRangeStyle,
  getMarkerStyle: sliderDom.getMarkerStyle,
  getMarkerGroupStyle: sliderDom.getMarkerGroupStyle,
}
