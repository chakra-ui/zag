import type { Scope } from "@zag-js/core"

export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `dialog:${ctx.id}:positioner`
export const getBackdropId = (ctx: Scope) => ctx.ids?.backdrop ?? `dialog:${ctx.id}:backdrop`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `dialog:${ctx.id}:content`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `dialog:${ctx.id}:trigger`
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
