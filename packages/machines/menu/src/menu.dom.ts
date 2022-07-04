import { isHTMLElement, nextById, prevById, queryAll, findByTypeahead } from "@zag-js/dom-utils"
import { first, last } from "@zag-js/utils"
import type { MachineContext as Ctx } from "./menu.types"

type HTMLEl = HTMLElement | null

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootNode: (ctx: Ctx) => ctx.rootNode ?? dom.getDoc(ctx),

  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `menu:${ctx.uid}:trigger`,
  getContextTriggerId: (ctx: Ctx) => ctx.ids?.contextTrigger ?? `menu:${ctx.uid}:ctx-trigger`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `menu:${ctx.uid}:content`,
  getArrowId: (ctx: Ctx) => `menu:${ctx.uid}:arrow`,
  getPositionerId: (ctx: Ctx) => `menu:${ctx.uid}:popper`,
  getGroupId: (ctx: Ctx, id: string) => ctx.ids?.group?.(id) ?? `menu:${ctx.uid}:group:${id}`,
  getLabelId: (ctx: Ctx, id: string) => ctx.ids?.label?.(id) ?? `menu:${ctx.uid}:label:${id}`,

  getContentEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getContentId(ctx)) as HTMLEl,
  getPositionerEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getPositionerId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getTriggerId(ctx)) as HTMLEl,
  getActiveItemEl: (ctx: Ctx) => (ctx.activeId ? dom.getRootNode(ctx).getElementById(ctx.activeId) : null),
  getArrowEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getArrowId(ctx)),

  getActiveElement: (ctx: Ctx) => dom.getDoc(ctx).activeElement as HTMLEl,
  getElements: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getContentId(ctx))
    const selector = `[role^="menuitem"][data-ownedby=${ownerId}]:not([data-disabled])`
    return queryAll(dom.getContentEl(ctx), selector)
  },
  getFirstEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getNextEl: (ctx: Ctx) => nextById(dom.getElements(ctx), ctx.activeId!, ctx.loop),
  getPrevEl: (ctx: Ctx) => prevById(dom.getElements(ctx), ctx.activeId!, ctx.loop),

  getElemByKey: (ctx: Ctx, key: string) =>
    findByTypeahead(dom.getElements(ctx), { state: ctx.typeahead, key, activeId: ctx.activeId }),

  isTargetDisabled: (v: EventTarget | null) => {
    return isHTMLElement(v) && v.dataset.disabled === ""
  },
  isTriggerItem: (el: HTMLElement | null) => {
    return !!el?.getAttribute("role")?.startsWith("menuitem") && !!el?.hasAttribute("aria-controls")
  },
}
