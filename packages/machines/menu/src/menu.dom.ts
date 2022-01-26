import { findByText, isHTMLElement, nextById, prevById, queryElements } from "@ui-machines/dom-utils"
import { first, last } from "@ui-machines/utils"
import { MachineContext as Ctx } from "./menu.types"

type HTMLEl = HTMLElement | null

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getTriggerId: (ctx: Ctx) => `menu-${ctx.uid}-trigger`,
  getMenuId: (ctx: Ctx) => `menu-${ctx.uid}-menulist`,
  getArrowId: (ctx: Ctx) => `popover-${ctx.uid}--arrow`,

  getMenuEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getMenuId(ctx)) as HTMLEl,
  getTriggerEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTriggerId(ctx)) as HTMLEl,
  getActiveItemEl: (ctx: Ctx) => (ctx.activeId ? dom.getDoc(ctx).getElementById(ctx.activeId) : null),
  getArrowEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getArrowId(ctx)),

  getActiveElement: (ctx: Ctx) => dom.getDoc(ctx).activeElement as HTMLEl,
  getElements: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getMenuId(ctx))
    const selector = `[role=menuitem][data-ownedby=${ownerId}]:not([data-disabled])`
    return queryElements(dom.getMenuEl(ctx), selector)
  },
  getFirstEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getNextEl: (ctx: Ctx) => nextById(dom.getElements(ctx), ctx.activeId!, ctx.loop),
  getPrevEl: (ctx: Ctx) => prevById(dom.getElements(ctx), ctx.activeId!, ctx.loop),

  getElemByKey: (ctx: Ctx, key: string) => findByText(dom.getElements(ctx), key, ctx.activeId),
  getChildMenus: (ctx: Ctx) => {
    return Object.values(ctx.children)
      .map((child) => dom.getMenuEl(child.state.context))
      .filter(isHTMLElement)
  },
  getParentMenus: (ctx: Ctx) => {
    const menus: HTMLElement[] = []
    let parent = ctx.parent
    while (parent) {
      const menu = dom.getMenuEl(parent.state.context)
      if (menu) menus.push(menu)
      parent = parent.state.context.parent
    }
    return menus
  },

  isTargetDisabled: (v: EventTarget | null) => {
    return isHTMLElement(v) && v.dataset.disabled === ""
  },
  isTriggerItem: (el: HTMLElement | null) => {
    return !!el?.getAttribute("role")?.startsWith("menuitem") && !!el?.hasAttribute("aria-controls")
  },
}
