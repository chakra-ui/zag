import { createScope, itemById, nextById, prevById, queryAll } from "@zag-js/dom-query"
import { first, last } from "@zag-js/utils"
import type { MachineContext as Ctx } from "./tabs.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `tabs:${ctx.id}`,
  getListId: (ctx: Ctx) => ctx.ids?.list ?? `tabs:${ctx.id}:list`,
  getContentId: (ctx: Ctx, id: string) => ctx.ids?.content ?? `tabs:${ctx.id}:content-${id}`,
  getTriggerId: (ctx: Ctx, id: string) => ctx.ids?.trigger ?? `tabs:${ctx.id}:trigger-${id}`,
  getIndicatorId: (ctx: Ctx) => ctx.ids?.indicator ?? `tabs:${ctx.id}:indicator`,

  getListEl: (ctx: Ctx) => dom.getById(ctx, dom.getListId(ctx)),
  getContentEl: (ctx: Ctx, id: string) => dom.getById(ctx, dom.getContentId(ctx, id)),
  getTriggerEl: (ctx: Ctx, id: string) => dom.getById(ctx, dom.getTriggerId(ctx, id)),
  getIndicatorEl: (ctx: Ctx) => dom.getById(ctx, dom.getIndicatorId(ctx)),

  getElements: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getListId(ctx))
    const selector = `[role=tab][data-ownedby='${ownerId}']:not([disabled])`
    return queryAll(dom.getListEl(ctx), selector)
  },

  getFirstTriggerEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastTriggerEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getNextTriggerEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), dom.getTriggerId(ctx, id), ctx.loopFocus),
  getPrevTriggerEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), dom.getTriggerId(ctx, id), ctx.loopFocus),
  getSelectedContentEl: (ctx: Ctx) => {
    if (!ctx.value) return
    return dom.getContentEl(ctx, ctx.value)
  },
  getSelectedTriggerEl: (ctx: Ctx) => {
    if (!ctx.value) return
    return dom.getTriggerEl(ctx, ctx.value)
  },

  getOffsetRect: (el: HTMLElement | undefined) => {
    return {
      left: el?.offsetLeft ?? 0,
      top: el?.offsetTop ?? 0,
      width: el?.offsetWidth ?? 0,
      height: el?.offsetHeight ?? 0,
    }
  },

  getRectById: (ctx: Ctx, id: string) => {
    const tab = itemById(dom.getElements(ctx), dom.getTriggerId(ctx, id))
    return dom.resolveRect(dom.getOffsetRect(tab))
  },

  resolveRect: (rect: Record<"width" | "height" | "left" | "top", number>) => ({
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    left: `${rect.left}px`,
    top: `${rect.top}px`,
  }),
})
