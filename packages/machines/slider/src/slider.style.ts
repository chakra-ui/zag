import type { Params } from "@zag-js/core"
import type { Style } from "@zag-js/types"
import { getValuePercent, toPx } from "@zag-js/utils"
import type { SliderSchema } from "./slider.types"
import { getFillSpan, getThumbExtent } from "./slider.utils"

type Ctx = Params<SliderSchema>

/* -----------------------------------------------------------------------------
 * Range style calculations
 * -----------------------------------------------------------------------------*/

export function getRangeOffsets(params: Pick<Ctx, "prop" | "computed" | "context">) {
  const [from, to] = getFillSpan(params)
  const extent = getThumbExtent(params)

  const toEdge = (percent: number, flip = false) => {
    const inset = percent === 0 || percent === 100 ? 0 : toInset(percent, extent)
    const edge = flip ? 100 - percent : percent
    if (!inset) return `${edge}%`
    return flip ? `calc(${edge}% + ${inset}px)` : `calc(${edge}% - ${inset}px)`
  }

  return { start: toEdge(from), end: toEdge(to, true) }
}

export function getRangeStyle(params: Pick<Ctx, "computed">): Style {
  const { computed } = params
  const isVertical = computed("isVertical")
  const isRtl = computed("isRtl")

  if (isVertical) {
    return {
      position: "absolute",
      bottom: "var(--slider-range-start)",
      top: "var(--slider-range-end)",
    }
  }
  return {
    position: "absolute",
    [isRtl ? "right" : "left"]: "var(--slider-range-start)",
    [isRtl ? "left" : "right"]: "var(--slider-range-end)",
  }
}

/* -----------------------------------------------------------------------------
 * Thumb style calculations
 * -----------------------------------------------------------------------------*/

function toInset(percent: number, extent: number) {
  return +(extent * (percent / 100 - 0.5)).toFixed(2)
}

export function getThumbOffset(params: Pick<Ctx, "context" | "prop">, value: number) {
  const { prop } = params
  const percent = getValuePercent(value, prop("min"), prop("max")) * 100
  const inset = toInset(percent, getThumbExtent(params))
  return inset ? `calc(${percent}% - ${inset}px)` : `${percent}%`
}

export function getVisibility(params: Pick<Ctx, "computed" | "prop">) {
  const { computed, prop } = params
  let visibility: "visible" | "hidden" = "visible"
  if (prop("thumbAlignment") === "contain" && !computed("hasMeasuredThumbSize")) {
    visibility = "hidden"
  }
  return visibility
}

export function getThumbStyle(params: Pick<Ctx, "computed" | "context" | "prop">, index: number): Style {
  const { computed, context } = params
  const placementProp = computed("isVertical") ? "bottom" : "insetInlineStart"
  const focusedIndex = context.get("focusedIndex")
  return {
    visibility: getVisibility(params),
    position: "absolute",
    transform: "var(--slider-thumb-transform)",
    [placementProp]: `var(--slider-thumb-offset-${index})`,
    zIndex: focusedIndex === index ? 1 : undefined,
  }
}

/* -----------------------------------------------------------------------------
 * Control style calculations
 * -----------------------------------------------------------------------------*/

export function getControlStyle(): Style {
  return {
    touchAction: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
    position: "relative",
  }
}

/* -----------------------------------------------------------------------------
 * Root style calculations
 * -----------------------------------------------------------------------------*/

export function getRootStyle(params: Pick<Ctx, "context" | "computed" | "prop">): Style {
  const { context, computed } = params
  const isVertical = computed("isVertical")
  const isRtl = computed("isRtl")
  const range = getRangeOffsets(params)
  const thumbSize = context.get("thumbSize")

  const offsetStyles = context.get("value").reduce<Style>((styles, value, index) => {
    const offset = getThumbOffset(params, value)
    return { ...styles, [`--slider-thumb-offset-${index}`]: offset }
  }, {})

  return {
    ...offsetStyles,
    "--slider-thumb-width": toPx(thumbSize?.width),
    "--slider-thumb-height": toPx(thumbSize?.height),
    "--slider-thumb-transform": isVertical ? "translateY(50%)" : isRtl ? "translateX(50%)" : "translateX(-50%)",
    "--slider-range-start": range.start,
    "--slider-range-end": range.end,
  }
}

/* -----------------------------------------------------------------------------
 * Marker style calculations
 * -----------------------------------------------------------------------------*/

export function getMarkerStyle(params: Pick<Ctx, "computed" | "context" | "prop">, value: number): Style {
  const { computed } = params
  const isHorizontal = computed("isHorizontal")
  const isRtl = computed("isRtl")
  return {
    visibility: getVisibility(params),
    position: "absolute",
    pointerEvents: "none",
    [isHorizontal ? "insetInlineStart" : "bottom"]: getThumbOffset(params, value),
    translate: "var(--translate-x) var(--translate-y)",
    "--translate-x": isHorizontal ? (isRtl ? "50%" : "-50%") : "0%",
    "--translate-y": !isHorizontal ? "50%" : "0%",
  }
}

/* -----------------------------------------------------------------------------
 * Label style calculations
 * -----------------------------------------------------------------------------*/

export function getMarkerGroupStyle(): Style {
  return {
    userSelect: "none",
    WebkitUserSelect: "none",
    pointerEvents: "none",
    position: "relative",
  }
}
