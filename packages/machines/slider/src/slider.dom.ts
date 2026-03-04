import type { Params, Scope } from "@zag-js/core"
import { dispatchInputValueEvent, queryAll } from "@zag-js/dom-query"
import type { Orientation, Point, Size } from "@zag-js/types"
import { clampPercent, getPercentValue } from "@zag-js/utils"
import type { SliderSchema, ThumbAlignment } from "./slider.types"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `slider:${ctx.id}`
export const getThumbId = (ctx: Scope, index: number) => ctx.ids?.thumb?.(index) ?? `slider:${ctx.id}:thumb:${index}`
export const getHiddenInputId = (ctx: Scope, index: number) =>
  ctx.ids?.hiddenInput?.(index) ?? `slider:${ctx.id}:input:${index}`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `slider:${ctx.id}:control`
export const getTrackId = (ctx: Scope) => ctx.ids?.track ?? `slider:${ctx.id}:track`
export const getRangeId = (ctx: Scope) => ctx.ids?.range ?? `slider:${ctx.id}:range`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `slider:${ctx.id}:label`
export const getValueTextId = (ctx: Scope) => ctx.ids?.valueText ?? `slider:${ctx.id}:value-text`
export const getMarkerId = (ctx: Scope, value: number) => ctx.ids?.marker?.(value) ?? `slider:${ctx.id}:marker:${value}`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getThumbEl = (ctx: Scope, index: number) => ctx.getById(getThumbId(ctx, index))
export const getThumbEls = (ctx: Scope) => queryAll(getControlEl(ctx), "[role=slider]")
export const getFirstThumbEl = (ctx: Scope) => getThumbEls(ctx)[0]
export const getHiddenInputEl = (ctx: Scope, index: number) =>
  ctx.getById<HTMLInputElement>(getHiddenInputId(ctx, index))
export const getControlEl = (ctx: Scope) => ctx.getById(getControlId(ctx))
export const getRangeEl = (ctx: Scope) => ctx.getById(getRangeId(ctx))

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
