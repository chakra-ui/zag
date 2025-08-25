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
  const { prop, scope } = params
  const controlEl = getControlEl(scope)
  if (!controlEl) return
  const relativePoint = getRelativePoint(point, controlEl)
  const orientation = prop("orientation")
  const dir = prop("dir")
  const inverted = !!prop("inverted")

  // Compute effective options for pointer -> percent mapping.
  // - Vertical defaults to inverted Y (bottom is 0). When `inverted` is true, we un-invert Y.
  // - Horizontal defaults to LTR behavior; when `inverted` is true we flip the mapping.
  //   In RTL, flipping is equivalent to neutralizing RTL inversion.
  let options: { orientation: "horizontal" | "vertical"; dir?: "ltr" | "rtl"; inverted?: any } = {
    orientation,
    dir,
  }

  if (orientation === "vertical") {
    options.inverted = { y: !inverted ? true : false }
  } else {
    // horizontal
    if (inverted) {
      // Achieve XOR with RTL: if RTL, neutralize dir-based inversion; if LTR, invert X.
      options = { orientation, dir: dir === "rtl" ? "ltr" : "ltr", inverted: dir === "rtl" ? undefined : { x: true } }
    }
  }

  const percent = relativePoint.getPercentValue(options)
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
