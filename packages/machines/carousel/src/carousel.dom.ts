import { defineDomHelpers, queryAll } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./carousel.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => `carousel:${ctx.id}`,
  getViewportId: (ctx: Ctx) => `carousel:${ctx.id}:viewport`,
  getSlideId: (ctx: Ctx, index: number) => `carousel:${ctx.id}:slider:${index}`,
  getSlideGroupId: (ctx: Ctx) => `carousel:${ctx.id}:slide-group`,

  getRootEl: (ctx: Ctx) => dom.queryById(ctx, dom.getRootId(ctx)),
  getViewportEl: (ctx: Ctx) => dom.queryById(ctx, dom.getViewportId(ctx)),
  getSlideGroupEl: (ctx: Ctx) => dom.queryById(ctx, dom.getSlideGroupId(ctx)),
  getSlideEls: (ctx: Ctx) => queryAll(dom.getSlideGroupEl(ctx), `[data-part=slide]`),
})
