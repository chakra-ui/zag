import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./tooltip.types"

export const dom = createScope({
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `tooltip:${ctx.id}:trigger`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `tooltip:${ctx.id}:content`,
  getArrowId: (ctx: Ctx) => ctx.ids?.arrow ?? `tooltip:${ctx.id}:arrow`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `tooltip:${ctx.id}:popper`,

  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getArrowEl: (ctx: Ctx) => dom.getById(ctx, dom.getArrowId(ctx)),
})
