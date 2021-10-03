import { first, last } from "tiny-array"
import { isElement } from "tiny-guard"
import { findByText, nextById, prevById, queryElements } from "tiny-nodelist"
import { MenuMachineContext as Ctx } from "./menu.machine"

type HTMLEl = HTMLElement | null

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getTriggerId: (ctx: Ctx) => `menu-${ctx.uid}-trigger`,
  getMenuId: (ctx: Ctx) => `menu-${ctx.uid}-menulist`,

  getMenuEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getMenuId(ctx)) as HTMLEl,
  getTriggerEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTriggerId(ctx)) as HTMLEl,
  getActiveItemEl: (ctx: Ctx) => (ctx.activeId ? dom.getDoc(ctx).getElementById(ctx.activeId) : null),

  getActiveElement: (ctx: Ctx) => dom.getDoc(ctx).activeElement as HTMLEl,
  getElements: (ctx: Ctx) =>
    queryElements(dom.getMenuEl(ctx), `[role=menuitem][data-ownedby=${dom.getMenuId(ctx)}]:not([data-disabled])`),

  getFirstEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), id),
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), id),

  getElemByKey: (ctx: Ctx, key: string) => {
    const activeId = dom.getMenuEl(ctx)?.getAttribute("aria-activedescendant")
    return findByText(dom.getElements(ctx), key, activeId)
  },

  getChildMenus: (ctx: Ctx) => {
    return Object.values(ctx.children)
      .map((child) => dom.getMenuEl(child.state.context))
      .filter(isElement)
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
    return isElement(v) && v.dataset.disabled === ""
  },
}
