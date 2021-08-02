import { DOMNodeList } from "@core-dom/node-list"
import { MenuMachineContext } from "./menu.machine"

export function getElementIds(uid: string) {
  return {
    button: `menu-${uid}-button`,
    menu: `menu-${uid}-menulist`,
  }
}

export function getElements(ctx: MenuMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)
  return {
    menu: doc.getElementById(ids.menu),
    button: doc.getElementById(ids.button),
  }
}

export function dom(ctx: MenuMachineContext) {
  const ids = getElementIds(ctx.uid)
  const { menu } = getElements(ctx)
  const selector = `[role=menuitem][data-ownedby=${ids.menu}]:not([disabled])`
  const collection = DOMNodeList.fromSelector(menu, selector)

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
