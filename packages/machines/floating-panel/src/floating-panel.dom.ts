import { createScope, isHTMLElement } from "@zag-js/dom-query"
import { createRect, getElementRect, getWindowRect, type Rect } from "@zag-js/rect-utils"
import { pick } from "@zag-js/utils"
import type { MachineContext as Ctx } from "./floating-panel.types"

export const dom = createScope({
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `float:${ctx.id}:trigger`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `float:${ctx.id}:positioner`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `float:${ctx.id}:content`,
  getTitleId: (ctx: Ctx) => ctx.ids?.title ?? `float:${ctx.id}:title`,
  getHeaderId: (ctx: Ctx) => ctx.ids?.header ?? `float:${ctx.id}:header`,

  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getHeaderEl: (ctx: Ctx) => dom.getById(ctx, dom.getHeaderId(ctx)),
  getBoundaryRect: (ctx: Ctx, allowOverflow: boolean) => {
    const boundaryEl = ctx.getBoundaryEl?.()
    let boundaryRect: Rect

    if (isHTMLElement(boundaryEl)) {
      boundaryRect = getElementRect(boundaryEl)
    } else {
      boundaryRect = getWindowRect(dom.getWin(ctx))
    }

    if (allowOverflow) {
      boundaryRect = createRect({
        x: -boundaryRect.width, // empty(left)
        y: boundaryRect.minY,
        width: boundaryRect.width * 3, // empty(left) + win + empty(right)
        height: boundaryRect.height * 2, // win + empty(bottom)
      })
    }

    return pick(boundaryRect, ["x", "y", "width", "height"])
  },
})
