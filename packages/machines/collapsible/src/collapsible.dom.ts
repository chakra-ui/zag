import type { Scope } from "@zag-js/core"
import { parts } from "./collapsible.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `${ctx.id}:trigger`

export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.trigger))
