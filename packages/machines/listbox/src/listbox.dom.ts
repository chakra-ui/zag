import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `select:${ctx.id}`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `select:${ctx.id}:content`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `select:${ctx.id}:trigger`
export const getClearTriggerId = (ctx: Scope) => ctx.ids?.clearTrigger ?? `select:${ctx.id}:clear-trigger`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `select:${ctx.id}:label`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `select:${ctx.id}:control`
export const getItemId = (ctx: Scope, id: string | number) => ctx.ids?.item?.(id) ?? `select:${ctx.id}:option:${id}`
export const getHiddenSelectId = (ctx: Scope) => ctx.ids?.hiddenSelect ?? `select:${ctx.id}:select`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `select:${ctx.id}:positioner`
export const getItemGroupId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroup?.(id) ?? `select:${ctx.id}:optgroup:${id}`
export const getItemGroupLabelId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroupLabel?.(id) ?? `select:${ctx.id}:optgroup-label:${id}`

export const getHiddenSelectEl = (ctx: Scope) => ctx.getById<HTMLSelectElement>(getHiddenSelectId(ctx))
export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getControlEl = (ctx: Scope) => ctx.getById(getControlId(ctx))
export const getTriggerEl = (ctx: Scope) => ctx.getById(getTriggerId(ctx))
export const getClearTriggerEl = (ctx: Scope) => ctx.getById(getClearTriggerId(ctx))
export const getPositionerEl = (ctx: Scope) => ctx.getById(getPositionerId(ctx))
export const getItemEl = (ctx: Scope, id: string | number) => ctx.getById(getItemId(ctx, id))
