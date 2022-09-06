import { defineDomHelpers } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./hover-card.types"

export const dom = defineDomHelpers({
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `popover:${ctx.id}:trigger`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `popover:${ctx.id}:content`,
  getPositionerId: (ctx: Ctx) => `popover:${ctx.id}:popper`,
  getArrowId: (ctx: Ctx) => `popover:${ctx.id}:arrow`,

  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
})
