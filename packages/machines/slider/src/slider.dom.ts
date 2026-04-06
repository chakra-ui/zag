import type { Params, Scope } from "@zag-js/core"
import { dispatchInputValueEvent } from "@zag-js/dom-query"
import type { Orientation, Point, Size } from "@zag-js/types"
import { clampPercent, getPercentValue } from "@zag-js/utils"
import type { SliderSchema, ThumbAlignment } from "./slider.types"
import { parts } from "./slider.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getThumbId = (ctx: Scope, index: number) => ctx.ids?.thumb?.(index) ?? `${ctx.id}:thumb:${index}`
export const getHiddenInputId = (ctx: Scope, index: number) =>
  ctx.ids?.hiddenInput?.(index) ?? `${ctx.id}:input:${index}`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getTrackId = (ctx: Scope) => ctx.ids?.track ?? `${ctx.id}:track`
export const getRangeId = (ctx: Scope) => ctx.ids?.range ?? `${ctx.id}:range`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getValueTextId = (ctx: Scope) => ctx.ids?.valueText ?? `${ctx.id}:value-text`
export const getMarkerId = (ctx: Scope, value: number) => ctx.ids?.marker?.(value) ?? `${ctx.id}:marker:${value}`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getThumbEl = (ctx: Scope, index: number) =>
  ctx.query(`${ctx.selector(parts.thumb)}[data-index="${index}"]`)
export const getThumbEls = (ctx: Scope) => ctx.queryAll(ctx.selector(parts.thumb))
export const getFirstThumbEl = (ctx: Scope) => getThumbEls(ctx)[0]
export const getHiddenInputEl = (ctx: Scope, index: number) =>
  ctx.getById<HTMLInputElement>(getHiddenInputId(ctx, index))
export const getControlEl = (ctx: Scope) => ctx.query(ctx.selector(parts.control))
export const getRangeEl = (ctx: Scope) => ctx.query(ctx.selector(parts.range))

const getThumbInset = (thumbSize: Size | null, thumbAlignment: ThumbAlignment, orientation: Orientation) => {
  const isContain = thumbAlignment === "contain"
  const isVertical = orientation === "vertical"
  return isContain ? (isVertical ? (thumbSize?.height ?? 0) : (thumbSize?.width ?? 0)) / 2 : 0
}

export const getPointValue = (params: Params<SliderSchema>, point: Point) => {
  const { context, prop, scope, refs } = params
  const controlEl = getControlEl(scope)
  if (!controlEl) return

  // Adjust point by thumb drag offset to maintain constant offset during drag
  const offset = refs.get("thumbDragOffset")
  const adjustedPoint = {
    x: point.x - (offset?.x ?? 0),
    y: point.y - (offset?.y ?? 0),
  }

  // For "contain" alignment, account for thumb inset when calculating value
  const thumbInset = getThumbInset(context.get("thumbSize"), prop("thumbAlignment"), prop("orientation"))

  const relativePoint = getRelativePointWithInset(adjustedPoint, controlEl, thumbInset)
  const percent = relativePoint.getPercentValue({
    orientation: prop("orientation"),
    dir: prop("dir"),
    inverted: { y: true },
  })
  return getPercentValue(percent, prop("min"), prop("max"), prop("step"))
}

function getRelativePointWithInset(point: Point, element: HTMLElement, inset: number) {
  const { left, top, width, height } = element.getBoundingClientRect()

  // Adjust for thumb inset in contain mode
  const effectiveWidth = width - inset * 2
  const effectiveHeight = height - inset * 2
  const effectiveLeft = left + inset
  const effectiveTop = top + inset

  const offset = {
    x: point.x - effectiveLeft,
    y: point.y - effectiveTop,
  }
  const percent = {
    x: effectiveWidth > 0 ? clampPercent(offset.x / effectiveWidth) : 0,
    y: effectiveHeight > 0 ? clampPercent(offset.y / effectiveHeight) : 0,
  }

  function getPercentValue(
    options: { dir?: string; orientation?: string; inverted?: { x?: boolean; y?: boolean } | boolean } = {},
  ) {
    const { dir = "ltr", orientation = "horizontal", inverted } = options
    const invertX = typeof inverted === "object" ? inverted.x : inverted
    const invertY = typeof inverted === "object" ? inverted.y : inverted
    if (orientation === "horizontal") {
      return dir === "rtl" || invertX ? 1 - percent.x : percent.x
    }
    return invertY ? 1 - percent.y : percent.y
  }

  return { offset, percent, getPercentValue }
}

export const dispatchChangeEvent = (ctx: Scope, value: number[]) => {
  value.forEach((value, index) => {
    const inputEl = getHiddenInputEl(ctx, index)
    if (!inputEl) return
    dispatchInputValueEvent(inputEl, { value })
  })
}

export const getOffsetRect = (el: HTMLElement | undefined) => ({
  left: el?.offsetLeft ?? 0,
  top: el?.offsetTop ?? 0,
  width: el?.offsetWidth ?? 0,
  height: el?.offsetHeight ?? 0,
})
