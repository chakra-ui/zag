import { createScope, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./carousel.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `carousel:${ctx.id}`,
  getViewportId: (ctx: Ctx) => ctx.ids?.viewport ?? `carousel:${ctx.id}:viewport`,
  getItemId: (ctx: Ctx, index: number) => ctx.ids?.item?.(index) ?? `carousel:${ctx.id}:item:${index}`,
  getItemGroupId: (ctx: Ctx) => ctx.ids?.itemGroup ?? `carousel:${ctx.id}:item-group`,
  getNextTriggerId: (ctx: Ctx) => ctx.ids?.nextTrigger ?? `carousel:${ctx.id}:next-trigger`,
  getPrevTriggerId: (ctx: Ctx) => ctx.ids?.prevTrigger ?? `carousel:${ctx.id}:prev-trigger`,
  getIndicatorGroupId: (ctx: Ctx) => ctx.ids?.indicatorGroup ?? `carousel:${ctx.id}:indicator-group`,
  getIndicatorId: (ctx: Ctx, index: number) => ctx.ids?.indicator?.(index) ?? `carousel:${ctx.id}:indicator:${index}`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getViewportEl: (ctx: Ctx) => dom.getById(ctx, dom.getViewportId(ctx)),
  getSlideGroupEl: (ctx: Ctx) => dom.getById(ctx, dom.getItemGroupId(ctx)),
  getSlideEls: (ctx: Ctx) => queryAll(dom.getSlideGroupEl(ctx), `[data-part=item]`),
})
