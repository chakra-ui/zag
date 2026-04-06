import type { Scope } from "@zag-js/core"
import { isFunction } from "@zag-js/utils"
import { parts } from "./dialog.anatomy"

// ID generators — only for parts referenced by ARIA attributes
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`
export const getTriggerId = (ctx: Scope, value?: string) => {
  const customId = ctx.ids?.trigger
  if (customId != null) return isFunction(customId) ? customId(value) : customId
  return value ? `${ctx.id}:trigger:${value}` : `${ctx.id}:trigger`
}
export const getTitleId = (ctx: Scope) => ctx.ids?.title ?? `${ctx.id}:title`
export const getDescriptionId = (ctx: Scope) => ctx.ids?.description ?? `${ctx.id}:description`

// Element lookups
export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getPositionerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.positioner))
export const getBackdropEl = (ctx: Scope) => ctx.query(ctx.selector(parts.backdrop))
export const getTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.trigger))
export const getTitleEl = (ctx: Scope) => ctx.query(ctx.selector(parts.title))
export const getDescriptionEl = (ctx: Scope) => ctx.query(ctx.selector(parts.description))
export const getCloseTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.closeTrigger))

export const getTriggerEls = (ctx: Scope) => ctx.queryAll<HTMLElement>(ctx.selector(parts.trigger))

export const getActiveTriggerEl = (ctx: Scope, value: string | null): HTMLElement | null => {
  if (value == null) return getTriggerEls(ctx)[0]
  return ctx.query(`${ctx.selector(parts.trigger)}[data-value="${value}"]`)
}
