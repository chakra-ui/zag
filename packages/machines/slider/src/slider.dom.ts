import type { Params, Scope } from "@zag-js/core"
import { dispatchInputValueEvent, getRelativePoint, queryAll } from "@zag-js/dom-query"
import type { Point } from "@zag-js/types"
import { getPercentValue } from "@zag-js/utils"
import type { SliderSchema } from "./slider.types"

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

export const getPointValue = (params: Params<SliderSchema>, point: Point) => {
  const { prop, scope, refs } = params
  const controlEl = getControlEl(scope)
  if (!controlEl) return

  // Adjust point by thumb drag offset to maintain constant offset during drag
  const offset = refs.get("thumbDragOffset")
  const adjustedPoint = {
    x: point.x - (offset?.x ?? 0),
    y: point.y - (offset?.y ?? 0),
  }

  const relativePoint = getRelativePoint(adjustedPoint, controlEl)
  const percent = relativePoint.getPercentValue({
    orientation: prop("orientation"),
    dir: prop("dir"),
    inverted: { y: true },
  })
  return getPercentValue(percent, prop("min"), prop("max"), prop("step"))
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
