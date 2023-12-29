import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./collapsible.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `collapsible:${ctx.id}`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `collapsible:${ctx.id}:content`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `collapsible:${ctx.id}:trigger`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
})
