import { getFocusables } from "@core-dom/element"
import { List } from "@core-foundation/list"
import { PopoverMachineContext } from "./popover.machine"

export function getElementIds(uid: string) {
  return {
    trigger: `popover-${uid}-trigger`,
    content: `popover-${uid}-content`,
    header: `popover-${uid}-header`,
    body: `popover-${uid}-body`,
  }
}

export function getElements(ctx: PopoverMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)

  return {
    doc,
    trigger: doc.getElementById(ids.trigger),
    content: doc.getElementById(ids.content),
    header: doc.getElementById(ids.header),
    body: doc.getElementById(ids.body),
  }
}

export function dom(ctx: PopoverMachineContext) {
  const { content } = getElements(ctx)
  return {
    getFirstFocusable() {
      const focusables = getFocusables(content)
      const list = new List(focusables)
      return !list.isEmpty ? list.first : content
    },
  }
}
