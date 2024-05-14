import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./dialog.types"

export const dom = createScope({
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `dialog:${ctx.id}:positioner`,
  getBackdropId: (ctx: Ctx) => ctx.ids?.backdrop ?? `dialog:${ctx.id}:backdrop`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `dialog:${ctx.id}:content`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `dialog:${ctx.id}:trigger`,
  getTitleId: (ctx: Ctx) => ctx.ids?.title ?? `dialog:${ctx.id}:title`,
  getDescriptionId: (ctx: Ctx) => ctx.ids?.description ?? `dialog:${ctx.id}:description`,
  getCloseTriggerId: (ctx: Ctx) => ctx.ids?.closeTrigger ?? `dialog:${ctx.id}:close`,

  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getBackdropEl: (ctx: Ctx) => dom.getById(ctx, dom.getBackdropId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getTitleEl: (ctx: Ctx) => dom.getById(ctx, dom.getTitleId(ctx)),
  getDescriptionEl: (ctx: Ctx) => dom.getById(ctx, dom.getDescriptionId(ctx)),
  getCloseTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getCloseTriggerId(ctx)),
})
