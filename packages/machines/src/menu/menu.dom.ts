import { NodeList } from "@core-dom/node-list"
import { is } from "@core-foundation/utils"
import { MenuMachineContext } from "./menu.machine"

export function getIds(uid: string) {
  return {
    trigger: `menu-${uid}-trigger`,
    menu: `menu-${uid}-menulist`,
  }
}

export function getElements(ctx: MenuMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getIds(ctx.uid)

  return {
    doc,
    activeElement: doc.activeElement as HTMLElement | null,
    menu: doc.getElementById(ids.menu),
    trigger: doc.getElementById(ids.trigger),
    activeItem: ctx.activeId ? doc.getElementById(ctx.activeId) : null,
  }
}

export function dom(ctx: MenuMachineContext) {
  const ids = getIds(ctx.uid)
  const { menu } = getElements(ctx)
  const selector = `[role=menuitem][data-ownedby=${ids.menu}]:not([data-disabled])`
  const collection = NodeList.fromSelector(menu, selector)

  return {
    first: collection.first,
    last: collection.last,
    prev: collection.prevById,
    next: collection.nextById,
    searchByKey(key: string) {
      const activeId = menu?.getAttribute("aria-activedescendant")
      return collection.findByText(key, activeId)
    },
  }
}

export function getChildMenus(ctx: MenuMachineContext) {
  return Object.values(ctx.children)
    .map((child) => getElements(child.state.context).menu)
    .filter(is.element)
}

export function getParentMenus(ctx: MenuMachineContext) {
  const menus: HTMLElement[] = []
  let parent = ctx.parent
  while (parent) {
    const { menu } = getElements(parent.state.context)
    if (menu) menus.push(menu)
    parent = parent.state.context.parent
  }
  return menus
}

export function isTargetDisabled(target: EventTarget | null): boolean {
  return is.element(target) && target.dataset.disabled === ""
}
