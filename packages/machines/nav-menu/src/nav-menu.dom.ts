import { createScope, itemById, nextById, prevById, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./nav-menu.types"
import { first, last } from "@zag-js/utils"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `nav-menu:${ctx.id}`,
  getTriggerId: (ctx: Ctx, id: string) => ctx.ids?.trigger?.(id) ?? `nav-menu:${ctx.id}:trigger:${id}`,
  getMenuContentId: (ctx: Ctx, id: string) => ctx.ids?.content?.(id) ?? `nav-menu:${ctx.id}:content:${id}`,
  getMenuContentEl: (ctx: Ctx, id: string) => dom.getById(ctx, dom.getMenuContentId(ctx, id)),
  getPositionerId: (ctx: Ctx, id: string) => ctx.ids?.positioner?.(id) ?? `nav-menu:${ctx.id}:popper:${id}`,
  getPositionerEl: (ctx: Ctx, id: string) => dom.getById(ctx, dom.getPositionerId(ctx, id)),
  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getTriggers: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getRootId(ctx))
    const selector = `[aria-controls][data-ownedby='${ownerId}']`
    return queryAll(dom.getRootEl(ctx), selector)
  },
  getTriggerEl: (ctx: Ctx, id: string) => dom.getById(ctx, dom.getTriggerId(ctx, id)),
  getFirstTriggerEl: (ctx: Ctx) => first(dom.getTriggers(ctx)),
  getLastTriggerEl: (ctx: Ctx) => last(dom.getTriggers(ctx)),
  getNextTriggerEl: (ctx: Ctx, id: string) => nextById(dom.getTriggers(ctx), dom.getTriggerId(ctx, id)),
  getPrevTriggerEl: (ctx: Ctx, id: string) => prevById(dom.getTriggers(ctx), dom.getTriggerId(ctx, id)),
  getMenuItems: (ctx: Ctx, id: string) => {
    const ownerId = CSS.escape(dom.getMenuContentId(ctx, id))
    const selector = `[data-ownedby='${ownerId}']`
    return queryAll(dom.getMenuContentEl(ctx, id), selector)
  },
  getMenuItemEl: (ctx: Ctx, id: string, itemId: string) => itemById(dom.getMenuItems(ctx, id), itemId),
  getFirstMenuItemEl: (ctx: Ctx, id: string) => first(dom.getMenuItems(ctx, id)),
  getLastMenuItemEl: (ctx: Ctx, id: string) => last(dom.getMenuItems(ctx, id)),
  getNextMenuItemEl: (ctx: Ctx, id: string, itemId: string) => nextById(dom.getMenuItems(ctx, id), itemId),
  getPrevMenuItemEl: (ctx: Ctx, id: string, itemId: string) => prevById(dom.getMenuItems(ctx, id), itemId),
})
