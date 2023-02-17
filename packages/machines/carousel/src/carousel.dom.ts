import { defineDomHelpers, queryAll } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./carousel.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => `carousel:${ctx.id}`,
  getViewportId: (ctx: Ctx) => `carousel:${ctx.id}:viewport`,
  getSlideId: (ctx: Ctx, index: number) => `carousel:${ctx.id}:slider:${index}`,
  getSlideGroupId: (ctx: Ctx) => `carousel:${ctx.id}:slide-group`,

  getRootEl: (ctx: Ctx) => dom.queryById(ctx, dom.getRootId(ctx)),
  getViewportEl: (ctx: Ctx) => dom.queryById(ctx, dom.getViewportId(ctx)),
  getSlideGroupEl: (ctx: Ctx) => dom.queryById(ctx, dom.getSlideGroupId(ctx)),
  getSlideEls: (ctx: Ctx) => queryAll(dom.getSlideGroupEl(ctx), `[data-part=slide]`),

  translateSlideGroup: (ctx: Ctx, snap: number) => {
    const sliderGroupEl = dom.getSlideGroupEl(ctx)
    sliderGroupEl.style.transform = ctx.isHorizontal ? `translate3d(${snap}px, 0, 0)` : `translate3d(0, ${snap}px, 0)`
  },

  // [0, -600px, -1200px]
  getScrollSnaps: (ctx: Ctx) => {
    const containerRect = ctx.containerRect
    if (!containerRect) return []
    return ctx.slideRects
      .map((rect) => containerRect[ctx.startEdge] - rect[ctx.startEdge])
      .map((snap) => -Math.abs(snap))
  },
})
