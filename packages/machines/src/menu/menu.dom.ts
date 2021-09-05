import { NodeList } from "@core-dom/node-list"
import { MenuMachineContext } from "./menu.machine"

export function getElementIds(uid: string) {
  return {
    trigger: `menu-${uid}-trigger`,
    menu: `menu-${uid}-menulist`,
  }
}

export function getElements(ctx: MenuMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)

  return {
    doc,
    activeElement: doc.activeElement as HTMLElement | null,
    menu: doc.getElementById(ids.menu),
    trigger: doc.getElementById(ids.trigger),
    activeItem: ctx.activeId ? doc.getElementById(ctx.activeId) : null,
  }
}

export function dom(ctx: MenuMachineContext) {
  const ids = getElementIds(ctx.uid)
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
