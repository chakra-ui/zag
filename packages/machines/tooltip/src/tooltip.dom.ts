import { defineDomHelpers, getScrollParent } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./tooltip.types"

export const dom = defineDomHelpers({
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `tooltip:${ctx.id}:trigger`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `tooltip:${ctx.id}:content`,
  getArrowId: (ctx: Ctx) => `tooltip:${ctx.id}:arrow`,
  getPositionerId: (ctx: Ctx) => `tooltip:${ctx.id}:popper`,

  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getArrowEl: (ctx: Ctx) => dom.getById(ctx, dom.getArrowId(ctx)),
  getScrollParent: (ctx: Ctx) => getScrollParent(dom.getTriggerEl(ctx)!),
})
