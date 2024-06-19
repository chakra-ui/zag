import { isHTMLElement, nextById, prevById, queryAll, getByTypeahead, createScope } from "@zag-js/dom-query"
import { first, last } from "@zag-js/utils"
import type { MachineContext as Ctx } from "./menu.types"

export const dom = createScope({
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `menu:${ctx.id}:trigger`,
  getContextTriggerId: (ctx: Ctx) => ctx.ids?.contextTrigger ?? `menu:${ctx.id}:ctx-trigger`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `menu:${ctx.id}:content`,
  getArrowId: (ctx: Ctx) => ctx.ids?.arrow ?? `menu:${ctx.id}:arrow`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `menu:${ctx.id}:popper`,
  getGroupId: (ctx: Ctx, id: string) => ctx.ids?.group?.(id) ?? `menu:${ctx.id}:group:${id}`,
  getGroupLabelId: (ctx: Ctx, id: string) => ctx.ids?.groupLabel?.(id) ?? `menu:${ctx.id}:group-label:${id}`,

  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getHighlightedItemEl: (ctx: Ctx) => (ctx.highlightedValue ? dom.getById(ctx, ctx.highlightedValue) : null),
  getArrowEl: (ctx: Ctx) => dom.getById(ctx, dom.getArrowId(ctx)),

  getElements: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getContentId(ctx))
    const selector = `[role^="menuitem"][data-ownedby=${ownerId}]:not([data-disabled])`
    return queryAll(dom.getContentEl(ctx), selector)
  },
  getFirstEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getNextEl: (ctx: Ctx, loop?: boolean) => nextById(dom.getElements(ctx), ctx.highlightedValue!, loop ?? ctx.loopFocus),
  getPrevEl: (ctx: Ctx, loop?: boolean) => prevById(dom.getElements(ctx), ctx.highlightedValue!, loop ?? ctx.loopFocus),

  getElemByKey: (ctx: Ctx, key: string) =>
    getByTypeahead(dom.getElements(ctx), { state: ctx.typeaheadState, key, activeId: ctx.highlightedValue }),

  isTargetDisabled: (v: EventTarget | null) => {
    return isHTMLElement(v) && (v.dataset.disabled === "" || v.hasAttribute("disabled"))
  },
  isTriggerItem: (el: HTMLElement | null) => {
    return !!el?.getAttribute("role")?.startsWith("menuitem") && !!el?.hasAttribute("aria-controls")
  },

  getOptionFromItemEl(el: HTMLElement) {
    return {
      id: el.id,
      name: el.dataset.name,
      value: el.dataset.value,
      valueText: el.dataset.valueText,
      type: el.dataset.type,
    }
  },
})
