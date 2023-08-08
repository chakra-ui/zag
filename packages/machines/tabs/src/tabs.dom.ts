import { createScope, itemById, nextById, prevById, queryAll } from "@zag-js/dom-query"
import { first, last } from "@zag-js/utils"
import type { MachineContext as Ctx } from "./tabs.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `tabs:${ctx.id}`,
  getTablistId: (ctx: Ctx) => ctx.ids?.tablist ?? `tabs:${ctx.id}:list`,
  getContentId: (ctx: Ctx, id: string) => ctx.ids?.content ?? `tabs:${ctx.id}:content-${id}`,
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
    return dom.getContentEl(ctx, ctx.value)
  },
  getActiveTabEl: (ctx: Ctx) => {
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
    return dom.resolveRect(dom.getOffsetRect(tab), ctx.orientation)
  },

  resolveRect(rect: Record<"width" | "height" | "left" | "top", number>, orientation?: "horizontal" | "vertical") {
    const sizeProp = orientation === "vertical" ? "height" : "width"
    const placementProp = orientation === "vertical" ? "top" : "left"
    return {
      [placementProp]: `${rect[placementProp]}px`,
      [sizeProp]: `${rect[sizeProp]}px`,
    }
  },
})
