import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `gridlist:${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `gridlist:${ctx.id}:label`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `gridlist:${ctx.id}:content`
export const getItemId = (ctx: Scope, id: string | number) => ctx.ids?.item?.(id) ?? `gridlist:${ctx.id}:item:${id}`
export const getCellId = (ctx: Scope, itemId: string | number, cellIndex: number) =>
  ctx.ids?.cell?.(itemId, cellIndex) ?? `gridlist:${ctx.id}:cell:${itemId}:${cellIndex}`
export const getItemGroupId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroup?.(id) ?? `gridlist:${ctx.id}:itemgroup:${id}`
export const getItemGroupLabelId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroupLabel?.(id) ?? `gridlist:${ctx.id}:itemgrouplabel:${id}`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getLabelEl = (ctx: Scope) => ctx.getById(getLabelId(ctx))
export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getItemEl = (ctx: Scope, id: string | number) => ctx.getById(getItemId(ctx, id))
export const getCellEl = (ctx: Scope, itemId: string | number, cellIndex: number) =>
  ctx.getById(getCellId(ctx, itemId, cellIndex))
export const getItemGroupEl = (ctx: Scope, id: string | number) => ctx.getById(getItemGroupId(ctx, id))
