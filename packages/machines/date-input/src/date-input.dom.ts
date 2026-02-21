import { queryAll } from "@zag-js/dom-query"
import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `date-input:${ctx.id}`
export const getLabelId = (ctx: Scope, index: number) =>
  ctx.ids?.label?.(index) ?? `date-input:${ctx.id}:label:${index}`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `date-input:${ctx.id}:control`
export const getSegmentGroupId = (ctx: Scope, index: number) =>
  ctx.ids?.segmentGroup?.(index) ?? `date-input:${ctx.id}:segment-group:${index}`
export const getHiddenInputId = (ctx: Scope, index: number) =>
  ctx.ids?.hiddenInput?.(index) ?? `date-input:${ctx.id}:hidden-input:${index}`

export const getControlEl = (ctx: Scope) => ctx.getById(getControlId(ctx))
export const getSegmentEls = (ctx: Scope) => queryAll<HTMLInputElement>(getControlEl(ctx), `[data-part=segment]`)
