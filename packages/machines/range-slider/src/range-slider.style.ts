import { unstable__dom } from "@zag-js/slider"
import type { Style } from "@zag-js/types"
import type { MachineContext as Ctx } from "./range-slider.types"

/* -----------------------------------------------------------------------------
 * Range style calculations
 * -----------------------------------------------------------------------------*/

export function getRangeOffsets(ctx: Ctx) {
  let start = (ctx.value[0] / ctx.max) * 100
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

  const offsetStyles = ctx.value.reduce((acc, value, index) => {
    const thumbSize = ctx.thumbSize?.[index] ?? { width: 0, height: 0 }
    const offset = unstable__dom.getThumbOffset({ ...ctx, value, thumbSize })
    return { ...acc, [`--slider-thumb-offset-${index}`]: offset }
  }, {} as Style)

  return {
    ...offsetStyles,
    "--slider-thumb-transform": ctx.isVertical ? "translateY(50%)" : "translateX(-50%)",
    "--slider-range-start": range.start,
    "--slider-range-end": range.end,
  }
}

export const styles = {
  getRootStyle,
  getControlStyle: unstable__dom.getControlStyle,
  getThumbStyle,
  getRangeStyle: unstable__dom.getRangeStyle,
  getMarkerStyle: unstable__dom.getMarkerStyle,
  getMarkerGroupStyle: unstable__dom.getMarkerGroupStyle,
}
