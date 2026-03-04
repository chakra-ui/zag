import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `listbox:${ctx.id}`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `listbox:${ctx.id}:content`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `listbox:${ctx.id}:label`
export const getItemId = (ctx: Scope, id: string | number) => ctx.ids?.item?.(id) ?? `listbox:${ctx.id}:item:${id}`
export const getItemGroupId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroup?.(id) ?? `listbox:${ctx.id}:item-group:${id}`
export const getItemGroupLabelId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroupLabel?.(id) ?? `listbox:${ctx.id}:item-group-label:${id}`

export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getItemEl = (ctx: Scope, id: string | number) => ctx.getById(getItemId(ctx, id))
