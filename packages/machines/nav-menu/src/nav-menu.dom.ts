import { createScope, nextById, prevById, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./nav-menu.types"
import { first, last } from "@zag-js/utils"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `nav-menu:${ctx.id}`,
  getListId: (ctx: Ctx) => ctx.ids?.list ?? `nav-menu:${ctx.id}:list`,
  getListEl: (ctx: Ctx) => dom.getById(ctx, dom.getListId(ctx)),
  getTriggerId: (ctx: Ctx, id: string) => ctx.ids?.trigger?.(id) ?? `nav-menu:${ctx.id}:trigger:${id}`,
  getTriggerEl: (ctx: Ctx, id: string) => dom.getById(ctx, dom.getTriggerId(ctx, id)),
  getLinkId: (ctx: Ctx, id: string) => ctx.ids?.link?.(id) ?? `nav-menu:${ctx.id}:link:${id}`,
  isItemEl: (el: HTMLElement | null) => el?.parentElement?.getAttribute("data-part") === "item",
  getContentId: (ctx: Ctx, id: string) => ctx.ids?.content?.(id) ?? `nav-menu:${ctx.id}:content:${id}`,
  getContentEl: (ctx: Ctx, id: string) => dom.getById(ctx, dom.getContentId(ctx, id)),
  getItems: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getListId(ctx))
    const selector = `[data-ownedby="${ownerId}"] > :is([data-part="trigger"], [data-part="link"])`
    return queryAll(dom.getListEl(ctx), selector)
  },
  getItemEl: (ctx: Ctx, id: string) => dom.getById(ctx, id),
  getNextItemEl: (ctx: Ctx) => nextById(dom.getItems(ctx), ctx.focusedId!),
  getPrevItemEl: (ctx: Ctx) => prevById(dom.getItems(ctx), ctx.focusedId!),
  getFirstItemEl: (ctx: Ctx) => first(dom.getItems(ctx)),
  getLastItemEl: (ctx: Ctx) => last(dom.getItems(ctx)),
  getMenuLinks: (ctx: Ctx, id: string) => {
    const selector = `[data-part="link"]`
    return queryAll(dom.getContentEl(ctx, id), selector)
  },
  getFirstMenuLinkEl: (ctx: Ctx, id: string) => first(dom.getMenuLinks(ctx, id)),
  getLastMenuLinkEl: (ctx: Ctx, id: string) => last(dom.getMenuLinks(ctx, id)),
  getNextMenuLinkEl: (ctx: Ctx, id: string) => nextById(dom.getMenuLinks(ctx, id), ctx.highlightedLinkId!),
  getPrevMenuLinkEl: (ctx: Ctx, id: string) => prevById(dom.getMenuLinks(ctx, id), ctx.highlightedLinkId!),
})
