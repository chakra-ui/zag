import { itemById, nextById, prevById, queryAll } from "@ui-machines/dom-utils"
import { first, last } from "@ui-machines/utils"
import { MachineContext as Ctx } from "./tabs.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => `tabs-${ctx.uid}`,
  getTablistId: (ctx: Ctx) => `tabs-${ctx.uid}-tablist`,
  getPanelId: (ctx: Ctx, id: string) => `tabs-${ctx.uid}-tabpanel-${id}`,
  getTabId: (ctx: Ctx, id: string) => `tabs-${ctx.uid}-tab-${id}`,

  getTablistEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTablistId(ctx)),
  getPanelEl: (ctx: Ctx, id: string) => dom.getDoc(ctx).getElementById(dom.getPanelId(ctx, id)),
  getTabEl: (ctx: Ctx, id: string) => dom.getDoc(ctx).getElementById(dom.getTabId(ctx, id)),
  getElements: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getTablistId(ctx))
    const selector = `[role=tab][data-ownedby='${ownerId}']:not([disabled])`
    return queryAll(dom.getTablistEl(ctx), selector)
  },
  getFirstEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), dom.getTabId(ctx, id), ctx.loop),
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), dom.getTabId(ctx, id), ctx.loop),
  getRectById: (ctx: Ctx, id: string) => {
    const empty = { offsetLeft: 0, offsetTop: 0, offsetWidth: 0, offsetHeight: 0 }
    const tab = itemById(dom.getElements(ctx), dom.getTabId(ctx, id)) ?? empty
    if (ctx.isVertical) {
      return { top: `${tab.offsetTop}px`, height: `${tab.offsetHeight}px` }
    }
    return { left: `${tab.offsetLeft}px`, width: `${tab.offsetWidth}px` }
  },
  getActiveTabPanelEl: (ctx: Ctx) => {
    if (!ctx.value) return
    const id = dom.getPanelId(ctx, ctx.value)
    return dom.getDoc(ctx).getElementById(id)
  },
}
