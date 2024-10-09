import { createScope, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./navigation-menu.types"

export const dom = createScope({
  getTriggerId: (ctx: Ctx, value: string) => `nav-menu:${ctx.id}:trigger:${value}`,
  getContentId: (ctx: Ctx, value: string) => `nav-menu:${ctx.id}:content:${value}`,
  getViewportId: (ctx: Ctx) => `nav-menu:${ctx.id}:viewport`,
  getListId: (ctx: Ctx) => `nav-menu:${ctx.id}:list`,
  getViewportEl: (ctx: Ctx) => dom.getById(ctx, dom.getViewportId(ctx)),
  getTriggerEl: (ctx: Ctx, value: string) => dom.getById(ctx, dom.getTriggerId(ctx, value)),
  getListEl: (ctx: Ctx) => dom.getById(ctx, dom.getListId(ctx)),
  getTriggerEls: (ctx: Ctx) => queryAll(dom.getListEl(ctx), `[data-part=trigger][data-uid='${ctx.id}']`),
})
