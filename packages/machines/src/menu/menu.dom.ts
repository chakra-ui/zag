import { NodeList } from "@core-dom/node-list"
import { is } from "@core-foundation/utils"
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

export function getFocusableElements(ctx: MenuMachineContext) {
  const { trigger } = getElements(ctx)

  const childMenus = Object.values(ctx.children).map((child) => {
    const { menu } = getElements(child.state.context)
    return menu
  })

  const elements = [...childMenus, trigger]

  let parent = ctx.parent
  while (parent) {
    const el = getElements(parent.state.context).menu
    elements.push(el)
    parent = parent.state.context.parent
  }

  return elements
}

export function isMenuItem(target: EventTarget | null) {
  return is.element(target) && !!target.getAttribute("role")?.startsWith("menuitem")
}

export function isTargetDisabled(event: { currentTarget: HTMLElement }): boolean {
  return event.currentTarget.dataset.disabled === ""
}
