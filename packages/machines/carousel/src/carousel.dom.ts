import { createScope, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./carousel.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `carousel:${ctx.id}`,
  getViewportId: (ctx: Ctx) => ctx.ids?.viewport ?? `carousel:${ctx.id}:viewport`,
  getSlideId: (ctx: Ctx, index: number) => ctx.ids?.slide?.(index) ?? `carousel:${ctx.id}:slide:${index}`,
  getSlideGroupId: (ctx: Ctx) => ctx.ids?.slideGroup ?? `carousel:${ctx.id}:slide-group`,
  getNextSliderTriggerId: (ctx: Ctx) => ctx.ids?.nextSlideTrigger ?? `carousel:${ctx.id}:next-slide-trigger`,
  getPrevSliderTriggerId: (ctx: Ctx) => ctx.ids?.prevSlideTrigger ?? `carousel:${ctx.id}:prev-slide-trigger`,
  getIndicatorGroupId: (ctx: Ctx) => ctx.ids?.indicatorGroup ?? `carousel:${ctx.id}:indicator-group`,
  getIndicatorId: (ctx: Ctx, index: number) => ctx.ids?.indicator?.(index) ?? `carousel:${ctx.id}:indicator:${index}`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getViewportEl: (ctx: Ctx) => dom.getById(ctx, dom.getViewportId(ctx)),
  getSlideGroupEl: (ctx: Ctx) => dom.getById(ctx, dom.getSlideGroupId(ctx)),
  getSlideEls: (ctx: Ctx) => queryAll(dom.getSlideGroupEl(ctx), `[data-part=slide]`),
})
