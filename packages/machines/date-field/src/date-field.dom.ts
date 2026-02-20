import { queryAll } from "@zag-js/dom-query"
import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `date-field:${ctx.id}`
export const getLabelId = (ctx: Scope, index: number) =>
  ctx.ids?.label?.(index) ?? `date-field:${ctx.id}:label:${index}`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `date-field:${ctx.id}:control`
export const getSegmentGroupId = (ctx: Scope, index: number) =>
  ctx.ids?.segmentGroup?.(index) ?? `date-field:${ctx.id}:segment-group:${index}`
export const getHiddenInputId = (ctx: Scope, index: number) =>
  ctx.ids?.hiddenInput?.(index) ?? `date-field:${ctx.id}:hidden-input:${index}`

export const getControlEl = (ctx: Scope) => ctx.getById(getControlId(ctx))
export const getSegmentEls = (ctx: Scope) => queryAll<HTMLInputElement>(getControlEl(ctx), `[data-part=segment]`)
