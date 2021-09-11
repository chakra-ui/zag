import { NodeList } from "@core-dom/node-list"
import { AccordionMachineContext } from "./accordion.machine"

export function getIds(uid: string) {
  return {
    root: `accordion-${uid}`,
    getGroupId: (id: string) => `accordion-${uid}-item-${id}`,
    getPanelId: (id: string) => `accordion-${uid}-panel-${id}`,
    getTriggerId: (id: string) => `accordion-${uid}-trigger-${id}`,
  }
}

export function dom(ctx: AccordionMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getIds(ctx.uid)
  const root = doc.getElementById(ids.root)

  const selector = `[aria-controls][data-ownedby='${ids.root}']:not([disabled])`
  const list = NodeList.fromSelector(root, selector)

  return {
    first: list.first,
    last: list.last,
    next(id: string) {
      return list.nextById(ids.getTriggerId(id))
    },
    prev(id: string) {
      return list.prevById(ids.getTriggerId(id))
    },
  }
}
