import { queryAll } from "@zag-js/dom-query"
import type { Scope } from "@zag-js/core"
import { parts } from "./date-input.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getLabelId = (ctx: Scope, index: number) => ctx.ids?.label?.(index) ?? `${ctx.id}:label:${index}`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getSegmentGroupId = (ctx: Scope, index: number) =>
  ctx.ids?.segmentGroup?.(index) ?? `${ctx.id}:segment-group:${index}`
export const getHiddenInputId = (ctx: Scope, index: number) =>
  ctx.ids?.hiddenInput?.(index) ?? `${ctx.id}:hidden-input:${index}`

export const getControlEl = (ctx: Scope) => ctx.query(ctx.selector(parts.control))
export const getSegmentEls = (ctx: Scope) => queryAll<HTMLInputElement>(getControlEl(ctx), `[${parts.segment.attr}]`)
