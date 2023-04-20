import { createScope, itemById, nextById, prevById, queryAll } from "@zag-js/dom-query"
import { first, last } from "@zag-js/utils"
import type { MachineContext as Ctx } from "./tabs.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `tabs:${ctx.id}`,
  getTablistId: (ctx: Ctx) => ctx.ids?.tablist ?? `tabs:${ctx.id}:list`,
  getContentId: (ctx: Ctx, id: string) => ctx.ids?.content ?? `tabs:${ctx.id}:content-${id}`,
  getContentGroupId: (ctx: Ctx) => ctx.ids?.contentGroup ?? `tabs:${ctx.id}:content-group`,
  getTriggerId: (ctx: Ctx, id: string) => ctx.ids?.trigger ?? `tabs:${ctx.id}:trigger-${id}`,
  getIndicatorId: (ctx: Ctx) => ctx.ids?.indicator ?? `tabs:${ctx.id}:indicator`,

  getTablistEl: (ctx: Ctx) => dom.getById(ctx, dom.getTablistId(ctx)),
  getContentEl: (ctx: Ctx, id: string) => dom.getById(ctx, dom.getContentId(ctx, id)),
  getTriggerEl: (ctx: Ctx, id: string) => dom.getById(ctx, dom.getTriggerId(ctx, id)),
  getIndicatorEl: (ctx: Ctx) => dom.getById(ctx, dom.getIndicatorId(ctx)),

  getElements: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getTablistId(ctx))
    const selector = `[role=tab][data-ownedby='${ownerId}']:not([disabled])`
    return queryAll(dom.getTablistEl(ctx), selector)
  },

  getFirstEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), dom.getTriggerId(ctx, id), ctx.loop),
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), dom.getTriggerId(ctx, id), ctx.loop),
  getActiveContentEl: (ctx: Ctx) => {
    if (!ctx.value) return
    const id = dom.getContentId(ctx, ctx.value)
    return dom.getById(ctx, id)
  },

  getRectById: (ctx: Ctx, id: string) => {
    const empty = {
      offsetLeft: 0,
      offsetTop: 0,
      offsetWidth: 0,
      offsetHeight: 0,
    }

    const tab = itemById(dom.getElements(ctx), dom.getTriggerId(ctx, id)) ?? empty

    if (ctx.isVertical) {
      return {
        top: `${tab.offsetTop}px`,
        height: `${tab.offsetHeight}px`,
      }
    }

    return {
      left: `${tab.offsetLeft}px`,
      width: `${tab.offsetWidth}px`,
    }
  },
})
