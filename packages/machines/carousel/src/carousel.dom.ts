import type { Scope } from "@zag-js/core"
import { getTabbables, queryAll } from "@zag-js/dom-query"
import { parts } from "./carousel.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getItemId = (ctx: Scope, index: number) => ctx.ids?.item?.(index) ?? `${ctx.id}:item:${index}`
export const getItemGroupId = (ctx: Scope) => ctx.ids?.itemGroup ?? `${ctx.id}:item-group`
export const getNextTriggerId = (ctx: Scope) => ctx.ids?.nextTrigger ?? `${ctx.id}:next-trigger`
export const getPrevTriggerId = (ctx: Scope) => ctx.ids?.prevTrigger ?? `${ctx.id}:prev-trigger`
export const getIndicatorGroupId = (ctx: Scope) => ctx.ids?.indicatorGroup ?? `${ctx.id}:indicator-group`
export const getIndicatorId = (ctx: Scope, index: number) =>
  ctx.ids?.indicator?.(index) ?? `${ctx.id}:indicator:${index}`

export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getItemGroupEl = (ctx: Scope) => ctx.query(ctx.selector(parts.itemGroup))
export const getItemEl = (ctx: Scope, index: number) => ctx.query(`${ctx.selector(parts.item)}[data-index="${index}"]`)
export const getItemEls = (ctx: Scope) => queryAll(getItemGroupEl(ctx), `[${parts.item.attr}]`)
export const getIndicatorEl = (ctx: Scope, page: number) =>
  ctx.query(`${ctx.selector(parts.indicator)}[data-index="${page}"]`)

export const syncTabIndex = (ctx: Scope) => {
  const el = getItemGroupEl(ctx)
  if (!el) return
  const tabbables = getTabbables(el)
  el.setAttribute("tabindex", tabbables.length > 0 ? "-1" : "0")
}
