import type { Scope } from "@zag-js/core"
import { queryAll } from "@zag-js/dom-query"
import { isFunction } from "@zag-js/utils"

export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `dialog:${ctx.id}:positioner`
export const getBackdropId = (ctx: Scope) => ctx.ids?.backdrop ?? `dialog:${ctx.id}:backdrop`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `dialog:${ctx.id}:content`
export const getTriggerId = (ctx: Scope, value?: string) => {
  const customId = ctx.ids?.trigger
  if (customId != null) return isFunction(customId) ? customId(value) : customId
  return value ? `dialog:${ctx.id}:trigger:${value}` : `dialog:${ctx.id}:trigger`
}
export const getTitleId = (ctx: Scope) => ctx.ids?.title ?? `dialog:${ctx.id}:title`
export const getDescriptionId = (ctx: Scope) => ctx.ids?.description ?? `dialog:${ctx.id}:description`
export const getCloseTriggerId = (ctx: Scope) => ctx.ids?.closeTrigger ?? `dialog:${ctx.id}:close`

export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getPositionerEl = (ctx: Scope) => ctx.getById(getPositionerId(ctx))
export const getBackdropEl = (ctx: Scope) => ctx.getById(getBackdropId(ctx))
export const getTriggerEl = (ctx: Scope) => ctx.getById(getTriggerId(ctx))
export const getTitleEl = (ctx: Scope) => ctx.getById(getTitleId(ctx))

export const getDescriptionEl = (ctx: Scope) => ctx.getById(getDescriptionId(ctx))

export const getCloseTriggerEl = (ctx: Scope) => ctx.getById(getCloseTriggerId(ctx))

export const getTriggerEls = (ctx: Scope) =>
  queryAll(ctx.getDoc(), `[data-scope="dialog"][data-part="trigger"][data-ownedby="${ctx.id}"]`)

export const getActiveTriggerEl = (ctx: Scope, value: string | null): HTMLElement | null => {
  return value == null ? getTriggerEls(ctx)[0] : ctx.getById(getTriggerId(ctx, value))
}
