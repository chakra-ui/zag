import { createScope, getTabbables, getWindow, queryAll } from "@zag-js/dom-query"
import { first, last, next, nextIndex, prev, prevIndex } from "@zag-js/utils"
import type { MachineContext as Ctx } from "./navigation-menu.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `nav-menu:${ctx.id}`,
  getTriggerId: (ctx: Ctx, value: string) => `nav-menu:${ctx.id}:trigger:${value}`,
  getContentId: (ctx: Ctx, value: string) => `nav-menu:${ctx.id}:content:${value}`,
  getViewportId: (ctx: Ctx) => `nav-menu:${ctx.id}:viewport`,
  getListId: (ctx: Ctx) => `nav-menu:${ctx.id}:list`,
  getIndicatorTrackId: (ctx: Ctx) => `nav-menu:${ctx.id}:indicator-track`,

  getTabbableEls: (ctx: Ctx, value: string) => getTabbables(dom.getContentEl(ctx, value)),
  getIndicatorTrackEl: (ctx: Ctx) => dom.getById(ctx, dom.getIndicatorTrackId(ctx)),
  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getViewportEl: (ctx: Ctx) => dom.getById(ctx, dom.getViewportId(ctx)),
  getTriggerEl: (ctx: Ctx, value: string) => dom.getById(ctx, dom.getTriggerId(ctx, value)),
  getListEl: (ctx: Ctx) => dom.getById(ctx, dom.getListId(ctx)),

  getContentEl: (ctx: Ctx, value: string) => dom.getById(ctx, dom.getContentId(ctx, value)),
  getContentEls: (ctx: Ctx) =>
    queryAll(dom.getDoc(ctx), `[data-scope=navigation-menu][data-part=content][data-uid='${ctx.id}']`),

  getTriggerEls: (ctx: Ctx) => queryAll(dom.getListEl(ctx), `[data-part=trigger][data-uid='${ctx.id}']`),
  getTopLevelEls: (ctx: Ctx) => {
    const topLevelTriggerSelector = `[data-part=trigger][data-uid='${ctx.id}']:not([data-disabled])`
    const topLevelLinkSelector = `[data-part=item] > [data-part=link]`
    return queryAll(dom.getListEl(ctx), `${topLevelTriggerSelector}, ${topLevelLinkSelector}`)
  },
  getFirstTopLevelEl: (ctx: Ctx) => first(dom.getTopLevelEls(ctx)),
  getLastTopLevelEl: (ctx: Ctx) => last(dom.getTopLevelEls(ctx)),
  getNextTopLevelEl: (ctx: Ctx, value: string) => {
    const elements = dom.getTopLevelEls(ctx)
    const values = toValues(elements)
    const idx = nextIndex(values, values.indexOf(value), { loop: false })
    return elements[idx]
  },
  getPrevTopLevelEl: (ctx: Ctx, value: string) => {
    const elements = dom.getTopLevelEls(ctx)
    const values = toValues(elements)
    const idx = prevIndex(values, values.indexOf(value), { loop: false })
    return elements[idx]
  },

  getLinkEls: (ctx: Ctx, value: string) => queryAll(dom.getContentEl(ctx, value), `[data-part=link]`),
  getFirstLinkEl: (ctx: Ctx, value: string) => first(dom.getLinkEls(ctx, value)),
  getLastLinkEl: (ctx: Ctx, value: string) => last(dom.getLinkEls(ctx, value)),
  getNextLinkEl: (ctx: Ctx, value: string, node: HTMLElement) => {
    const elements = dom.getLinkEls(ctx, value)
    return next(elements, elements.indexOf(node), { loop: true })
  },
  getPrevLinkEl: (ctx: Ctx, value: string, node: HTMLElement) => {
    const elements = dom.getLinkEls(ctx, value)
    return prev(elements, elements.indexOf(node), { loop: true })
  },
})

const toValues = (els: HTMLElement[]) => els.map((el) => el.getAttribute("data-value"))

export function trackResizeObserver(element: HTMLElement | null, onResize: () => void) {
  if (!element) return null
  let frame = 0
  const win = getWindow(element)
  const obs = new win.ResizeObserver(() => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(onResize)
  })

  obs.observe(element)

  return () => {
    cancelAnimationFrame(frame)
    obs.unobserve(element)
  }
}
