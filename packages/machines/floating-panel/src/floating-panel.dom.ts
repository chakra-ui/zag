import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./floating-panel.types"

export const dom = createScope({
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `float:${ctx.id}:trigger`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `float:${ctx.id}:positioner`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `float:${ctx.id}:content`,
  getTitleId: (ctx: Ctx) => ctx.ids?.title ?? `float:${ctx.id}:title`,
  getHeaderId: (ctx: Ctx) => ctx.ids?.header ?? `float:${ctx.id}:header`,

  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getHeaderEl: (ctx: Ctx) => dom.getById(ctx, dom.getHeaderId(ctx)),
})
