import type { Scope } from "@zag-js/core"

export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `hover-card:${ctx.id}:trigger`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `hover-card:${ctx.id}:content`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `hover-card:${ctx.id}:popper`
export const getArrowId = (ctx: Scope) => ctx.ids?.arrow ?? `hover-card:${ctx.id}:arrow`

export const getTriggerEl = (ctx: Scope) => ctx.getById(getTriggerId(ctx))
export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getPositionerEl = (ctx: Scope) => ctx.getById(getPositionerId(ctx))
