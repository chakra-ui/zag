import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./floating-panel.types"

export const dom = createScope({
  getTriggerId: (ctx: Ctx) => `float:${ctx.id}:trigger`,
  getPositionerId: (ctx: Ctx) => `float:${ctx.id}:positioner`,
  getContentId: (ctx: Ctx) => `float:${ctx.id}:content`,
  getTitleId: (ctx: Ctx) => `float:${ctx.id}:title`,

  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
})
