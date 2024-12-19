import { createScope, getTabbables, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./carousel.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `carousel:${ctx.id}`,
  getItemId: (ctx: Ctx, index: number) => ctx.ids?.item?.(index) ?? `carousel:${ctx.id}:item:${index}`,
  getItemGroupId: (ctx: Ctx) => ctx.ids?.itemGroup ?? `carousel:${ctx.id}:item-group`,
  getNextTriggerId: (ctx: Ctx) => ctx.ids?.nextTrigger ?? `carousel:${ctx.id}:next-trigger`,
  getPrevTriggerId: (ctx: Ctx) => ctx.ids?.prevTrigger ?? `carousel:${ctx.id}:prev-trigger`,
  getIndicatorGroupId: (ctx: Ctx) => ctx.ids?.indicatorGroup ?? `carousel:${ctx.id}:indicator-group`,
  getIndicatorId: (ctx: Ctx, index: number) => ctx.ids?.indicator?.(index) ?? `carousel:${ctx.id}:indicator:${index}`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getItemGroupEl: (ctx: Ctx) => dom.getById(ctx, dom.getItemGroupId(ctx))!,
  getItemEl: (ctx: Ctx, index: number) => dom.getById(ctx, dom.getItemId(ctx, index)),
  getItemEls: (ctx: Ctx) => queryAll(dom.getItemGroupEl(ctx), `[data-part=item]`),
  getActiveIndicatorEl: (ctx: Ctx) => dom.getById(ctx, dom.getIndicatorId(ctx, ctx.page))!,

  syncTabIndex(ctx: Ctx) {
    const el = dom.getItemGroupEl(ctx)
    if (!el) return
    const tabbables = getTabbables(el)
    if (tabbables.length > 0) {
      el.removeAttribute("tabindex")
    } else {
      el.setAttribute("tabindex", "0")
    }
  },
})
