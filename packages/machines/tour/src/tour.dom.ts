import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./tour.types"

export const dom = createScope({
  getContentId: (ctx: Ctx) => `tour-content-${ctx.id}`,
  getTitleId: (ctx: Ctx) => `tour-title-${ctx.id}`,
  getPositionerId: (ctx: Ctx) => `tour-positioner-${ctx.id}`,
  getArrowId: (ctx: Ctx) => `tour-arrow-${ctx.id}`,
  getDescriptionId: (ctx: Ctx) => `tour-desc-${ctx.id}`,
  getOverlayId: (ctx: Ctx) => `tour-overlay-${ctx.id}`,
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getOverlayEl: (ctx: Ctx) => dom.getById(ctx, dom.getOverlayId(ctx)),
})
