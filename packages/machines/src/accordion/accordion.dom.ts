import { DOMNodeList } from "@core-dom/node-list"
import { AccordionMachineContext } from "./accordion.machine"

export function getElementIds(uid: string) {
  return {
    root: `accordion-${uid}`,
    getGroupId: (id: string) => `accordion-${uid}-item-${id}`,
    getPanelId: (id: string) => `accordion-${uid}-panel-${id}`,
    getTriggerId: (id: string) => `accordion-${uid}-trigger-${id}`,
  }
}

export function dom(ctx: AccordionMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)
  const root = doc.getElementById(ids.root)

  const selector = `[aria-controls][data-ownedby='${ids.root}']:not([disabled])`
  const collection = DOMNodeList.fromSelector(root, selector)

  return {
    first: collection.first,
    last: collection.last,
    next(id: string) {
      return collection.nextById(ids.getTriggerId(id))
    },
    prev(id: string) {
      return collection.prevById(ids.getTriggerId(id))
    },
  }
}
