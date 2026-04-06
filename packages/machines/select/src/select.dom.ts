import type { Scope } from "@zag-js/core"
import { parts } from "./select.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `${ctx.id}:trigger`
export const getClearTriggerId = (ctx: Scope) => ctx.ids?.clearTrigger ?? `${ctx.id}:clear-trigger`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getItemId = (ctx: Scope, id: string | number) => ctx.ids?.item?.(id) ?? `${ctx.id}:option:${id}`
export const getHiddenSelectId = (ctx: Scope) => ctx.ids?.hiddenSelect ?? `${ctx.id}:select`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `${ctx.id}:positioner`
export const getItemGroupId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroup?.(id) ?? `${ctx.id}:optgroup:${id}`
export const getItemGroupLabelId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroupLabel?.(id) ?? `${ctx.id}:optgroup-label:${id}`

// Element lookups — use querySelector with merged data attributes
export const getHiddenSelectEl = (ctx: Scope) => ctx.getById<HTMLSelectElement>(getHiddenSelectId(ctx))
export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getControlEl = (ctx: Scope) => ctx.query(ctx.selector(parts.control))
export const getTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.trigger))
export const getClearTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.clearTrigger))
export const getPositionerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.positioner))
export const getItemEl = (ctx: Scope, id: string | number | null) => {
  if (id == null) return null
  return ctx.query(`${ctx.selector(parts.item)}[data-value="${id}"]`)
}
