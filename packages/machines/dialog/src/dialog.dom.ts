import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./dialog.types"

export const dom = createScope({
  getContainerId: (ctx: Ctx) => ctx.ids?.container ?? `dialog:${ctx.id}:container`,
  getBackdropId: (ctx: Ctx) => ctx.ids?.backdrop ?? `dialog:${ctx.id}:backdrop`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `dialog:${ctx.id}:content`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `dialog:${ctx.id}:trigger`,
  getTitleId: (ctx: Ctx) => ctx.ids?.title ?? `dialog:${ctx.id}:title`,
  getDescriptionId: (ctx: Ctx) => ctx.ids?.description ?? `dialog:${ctx.id}:description`,
  getCloseTriggerId: (ctx: Ctx) => ctx.ids?.closeTrigger ?? `dialog:${ctx.id}:close`,

  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getContainerEl: (ctx: Ctx) => dom.getById(ctx, dom.getContainerId(ctx)),
  getTitleEl: (ctx: Ctx) => dom.getById(ctx, dom.getTitleId(ctx)),
  getDescriptionEl: (ctx: Ctx) => dom.getById(ctx, dom.getDescriptionId(ctx)),
})
