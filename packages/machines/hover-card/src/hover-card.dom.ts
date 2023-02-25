import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./hover-card.types"

export const dom = createScope({
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `hover-card:${ctx.id}:trigger`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `hover-card:${ctx.id}:content`,
  getPositionerId: (ctx: Ctx) => `hover-card:${ctx.id}:popper`,
  getArrowId: (ctx: Ctx) => `hover-card:${ctx.id}:arrow`,

  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
})
