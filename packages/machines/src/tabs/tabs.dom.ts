import { NodeList } from "@core-dom/node-list"
import { TabsMachineContext } from "./tabs.machine"

export function getElementIds(uid: string) {
  return {
    tablist: `tabs-${uid}-tablist`,
    getPanelId: (id: string) => `tabs-${uid}-tabpanel-${id}`,
    getTabId: (id: string) => `tabs-${uid}-tab-${id}`,
  }
}

export function dom(ctx: TabsMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)
  const tablist = doc.getElementById(ids.tablist)

  const selector = `[role=tab][data-ownedby='${ids.tablist}']`
  const collection = NodeList.fromSelector(tablist, selector)

  return {
    first: collection.first,
    last: collection.last,
    next(id: string) {
      return collection.nextById(ids.getTabId(id))
    },
    prev(id: string) {
      return collection.prevById(ids.getTabId(id))
    },
    rectById(id: string) {
      const tab = collection.itemById(ids.getTabId(id))
      return {
        left: tab?.offsetLeft,
        width: tab?.offsetWidth,
      }
    },
  }
}
