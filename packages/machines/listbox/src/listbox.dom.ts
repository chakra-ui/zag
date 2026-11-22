import { SELECT_ALL_VALUE } from "./utils/select-all"
import type { Scope } from "@zag-js/core"
import { parts } from "./listbox.anatomy"

// ID generators — only for parts referenced by ARIA attributes
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`
export const getListId = (ctx: Scope) => ctx.ids?.list ?? `${ctx.id}:list`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getItemId = (ctx: Scope, id: string | number) => ctx.ids?.item?.(id) ?? `${ctx.id}:item:${id}`
export const getItemGroupId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroup?.(id) ?? `${ctx.id}:item-group:${id}`
export const getItemGroupLabelId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroupLabel?.(id) ?? `${ctx.id}:item-group-label:${id}`

// Element lookups — use querySelector with merged data attributes
export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getListEl = (ctx: Scope) => ctx.query(ctx.selector(parts.list))
export const getSelectAllEl = (ctx: Scope) => ctx.query(`${ctx.selector(parts.item)}[data-type="select-all"]`)
export const getItemEl = (ctx: Scope, id: string | number) =>
  id === SELECT_ALL_VALUE ? getSelectAllEl(ctx) : ctx.query(`${ctx.selector(parts.item)}[data-value="${id}"]`)

/** Whether a pinned option is rendered and showing, so the keyboard can reach it */
export const isShown = (el: HTMLElement | null) => !!el && !el.hidden
