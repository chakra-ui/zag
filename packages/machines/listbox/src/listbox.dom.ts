import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `select:${ctx.id}`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `select:${ctx.id}:content`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `select:${ctx.id}:label`
export const getItemId = (ctx: Scope, id: string | number) => ctx.ids?.item?.(id) ?? `select:${ctx.id}:option:${id}`
export const getItemGroupId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroup?.(id) ?? `select:${ctx.id}:optgroup:${id}`
export const getItemGroupLabelId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroupLabel?.(id) ?? `select:${ctx.id}:optgroup-label:${id}`

export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getItemEl = (ctx: Scope, id: string | number) => ctx.getById(getItemId(ctx, id))
