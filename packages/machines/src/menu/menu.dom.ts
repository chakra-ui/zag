import { DOMCollection } from "@ui-machines/utils"
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

export function collection(ctx: MenuMachineContext) {
  const ids = getElementIds(ctx.uid)
  const { menu } = getElements(ctx)
  const selector = `[role=menuitem][data-ownedby=${ids.menu}]:not([disabled])`
  return new DOMCollection(menu, selector)
}
