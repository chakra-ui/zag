import { createDOMCollection } from "@ui-machines/utils"
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
  const {
    prevById,
    nextById,
    first,
    last,
    findByEventKey,
    getActiveDescendantId,
  } = createDOMCollection(menu, selector)

  return {
    first,
    last,
    prev: prevById,
    next: nextById,
    searchByKey(key: string) {
      const activeId = getActiveDescendantId()
      return findByEventKey(key, activeId)
    },
  }
}
