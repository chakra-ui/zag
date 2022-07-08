import { withRootHelpers, itemById, nextById, prevById, queryAll } from "@zag-js/dom-utils"
import { first, last } from "@zag-js/utils"
import type { MachineContext as Ctx } from "./tabs.types"

export const dom = withRootHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `tabs:${ctx.id}`,
  getTriggerGroupId: (ctx: Ctx) => ctx.ids?.triggerGroup ?? `tabs:${ctx.id}:trigger-group`,
  getContentId: (ctx: Ctx, id: string) => ctx.ids?.content ?? `tabs:${ctx.id}:content-${id}`,
  getContentGroupId: (ctx: Ctx) => ctx.ids?.contentGroup ?? `tabs:${ctx.id}:content-group`,
  getTriggerId: (ctx: Ctx, id: string) => ctx.ids?.trigger ?? `tabs:${ctx.id}:trigger-${id}`,
  getIndicatorId: (ctx: Ctx) => `tabs:${ctx.id}:indicator`,

  getTriggerGroupEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getTriggerGroupId(ctx)),
  getContentEl: (ctx: Ctx, id: string) => dom.getRootNode(ctx).getElementById(dom.getContentId(ctx, id)),
  getTriggerEl: (ctx: Ctx, id: string) => dom.getRootNode(ctx).getElementById(dom.getTriggerId(ctx, id)),
  getIndicatorEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getIndicatorId(ctx)),

  getElements: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getTriggerGroupId(ctx))
    const selector = `[role=tab][data-ownedby='${ownerId}']:not([disabled])`
    return queryAll(dom.getTriggerGroupEl(ctx), selector)
  },

  getFirstEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), dom.getTriggerId(ctx, id), ctx.loop),
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), dom.getTriggerId(ctx, id), ctx.loop),
  getActiveContentEl: (ctx: Ctx) => {
    if (!ctx.value) return
    const id = dom.getContentId(ctx, ctx.value)
    return dom.getRootNode(ctx).getElementById(id)
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
