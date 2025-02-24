import type { Scope } from "@zag-js/core"
import { getTabbables, queryAll } from "@zag-js/dom-query"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `carousel:${ctx.id}`
export const getItemId = (ctx: Scope, index: number) => ctx.ids?.item?.(index) ?? `carousel:${ctx.id}:item:${index}`
export const getItemGroupId = (ctx: Scope) => ctx.ids?.itemGroup ?? `carousel:${ctx.id}:item-group`
export const getNextTriggerId = (ctx: Scope) => ctx.ids?.nextTrigger ?? `carousel:${ctx.id}:next-trigger`
export const getPrevTriggerId = (ctx: Scope) => ctx.ids?.prevTrigger ?? `carousel:${ctx.id}:prev-trigger`
export const getIndicatorGroupId = (ctx: Scope) => ctx.ids?.indicatorGroup ?? `carousel:${ctx.id}:indicator-group`
export const getIndicatorId = (ctx: Scope, index: number) =>
  ctx.ids?.indicator?.(index) ?? `carousel:${ctx.id}:indicator:${index}`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getItemGroupEl = (ctx: Scope) => ctx.getById(getItemGroupId(ctx))
export const getItemEl = (ctx: Scope, index: number) => ctx.getById(getItemId(ctx, index))
export const getItemEls = (ctx: Scope) => queryAll(getItemGroupEl(ctx), `[data-part=item]`)
export const getIndicatorEl = (ctx: Scope, page: number) => ctx.getById(getIndicatorId(ctx, page))

export const syncTabIndex = (ctx: Scope) => {
  const el = getItemGroupEl(ctx)
  if (!el) return
  const tabbables = getTabbables(el)
  if (tabbables.length > 0) {
    el.removeAttribute("tabindex")
  } else {
    el.setAttribute("tabindex", "0")
  }
}
