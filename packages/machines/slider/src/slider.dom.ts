import type { Params, Scope } from "@zag-js/core"
import { dispatchInputValueEvent } from "@zag-js/dom-query"
import type { Point } from "@zag-js/types"
import { clampPercent, getPercentValue } from "@zag-js/utils"
import { parts } from "./slider.anatomy"
import type { SliderSchema } from "./slider.types"
import { getThumbExtent } from "./slider.utils"

export const getHiddenInputId = (ctx: Scope, index: number) =>
  ctx.ids?.hiddenInput?.(index) ?? `${ctx.id}:input:${index}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`

export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getThumbEl = (ctx: Scope, index: number) =>
  ctx.query(`${ctx.selector(parts.thumb)}[data-index="${index}"]`)
export const getThumbEls = (ctx: Scope) => ctx.queryAll(ctx.selector(parts.thumb))
export const getFirstThumbEl = (ctx: Scope) => getThumbEls(ctx)[0]
export const getHiddenInputEl = (ctx: Scope, index: number) =>
  ctx.getById<HTMLInputElement>(getHiddenInputId(ctx, index))
export const getControlEl = (ctx: Scope) => ctx.query(ctx.selector(parts.control))

export const getPointValue = (params: Params<SliderSchema>, point: Point) => {
  const { prop, scope, refs } = params
  const controlEl = getControlEl(scope)
  if (!controlEl) return

  // Keep the pointer's offset from the thumb center for the whole drag
  const offset = refs.get("thumbDragOffset")
  const rect = controlEl.getBoundingClientRect()
  const inset = getThumbExtent(params) / 2

  let percent: number
  if (prop("orientation") === "vertical") {
    const length = rect.height - inset * 2
    percent = length > 0 ? 1 - clampPercent((point.y - (offset?.y ?? 0) - rect.top - inset) / length) : 0
  } else {
    const length = rect.width - inset * 2
    const x = length > 0 ? clampPercent((point.x - (offset?.x ?? 0) - rect.left - inset) / length) : 0
    percent = prop("dir") === "rtl" ? 1 - x : x
  }

  return getPercentValue(percent, prop("min"), prop("max"), prop("step"))
}

export const dispatchChangeEvent = (ctx: Scope, value: number[]) => {
  value.forEach((value, index) => {
    const inputEl = getHiddenInputEl(ctx, index)
    if (!inputEl) return
    dispatchInputValueEvent(inputEl, { value })
  })
}
