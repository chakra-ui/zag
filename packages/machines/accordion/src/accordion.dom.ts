import { nextById, prevById, queryAll } from "@zag-js/dom-query"
import { first, last } from "@zag-js/utils"
import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `accordion:${ctx.id}`
export const getItemId = (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `accordion:${ctx.id}:item:${value}`
export const getItemContentId = (ctx: Scope, value: string) =>
  ctx.ids?.itemContent?.(value) ?? `accordion:${ctx.id}:content:${value}`
export const getItemTriggerId = (ctx: Scope, value: string) =>
  ctx.ids?.itemTrigger?.(value) ?? `accordion:${ctx.id}:trigger:${value}`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getTriggerEls = (ctx: Scope) => {
  const ownerId = CSS.escape(getRootId(ctx))
  const selector = `[aria-controls][data-ownedby='${ownerId}']:not([disabled])`
  return queryAll(getRootEl(ctx), selector)
}

export const getFirstTriggerEl = (ctx: Scope) => first(getTriggerEls(ctx))
export const getLastTriggerEl = (ctx: Scope) => last(getTriggerEls(ctx))
export const getNextTriggerEl = (ctx: Scope, id: string) => nextById(getTriggerEls(ctx), getItemTriggerId(ctx, id))
export const getPrevTriggerEl = (ctx: Scope, id: string) => prevById(getTriggerEls(ctx), getItemTriggerId(ctx, id))
