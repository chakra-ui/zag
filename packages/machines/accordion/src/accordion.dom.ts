import { nextById, prevById, queryAll } from "@zag-js/dom-query"
import { first, last } from "@zag-js/utils"
import type { Scope } from "@zag-js/core"
import { parts } from "./accordion.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getItemId = (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `${ctx.id}:item:${value}`
export const getItemContentId = (ctx: Scope, value: string) =>
  ctx.ids?.itemContent?.(value) ?? `${ctx.id}:content:${value}`
export const getItemTriggerId = (ctx: Scope, value: string) =>
  ctx.ids?.itemTrigger?.(value) ?? `${ctx.id}:trigger:${value}`

export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getTriggerEls = (ctx: Scope) => {
  const ownerId = CSS.escape(ctx.id!)
  const selector = `[data-controls][${parts.itemTrigger.attr}='${ownerId}']:not([disabled])`
  return queryAll(getRootEl(ctx), selector)
}

export const getFirstTriggerEl = (ctx: Scope) => first(getTriggerEls(ctx))
export const getLastTriggerEl = (ctx: Scope) => last(getTriggerEls(ctx))
export const getNextTriggerEl = (ctx: Scope, id: string) => nextById(getTriggerEls(ctx), getItemTriggerId(ctx, id))
export const getPrevTriggerEl = (ctx: Scope, id: string) => prevById(getTriggerEls(ctx), getItemTriggerId(ctx, id))
