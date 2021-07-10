import { createCollection } from "@chakra-ui/utilities"
import { TabsMachineContext } from "./tabs.machine"

export function getElementIds(uid: string) {
  return {
    tablist: `tabs-${uid}-tablist`,
    getPanelId: (id: string) => `tabs-${uid}-tabpanel-${id}`,
    getTabId: (id: string) => `tabs-${uid}-tab-${id}`,
  }
}

export function collection(ctx: TabsMachineContext) {
  const doc = ctx.doc ?? document

  const ids = getElementIds(ctx.uid)
  const tablist = doc.getElementById(ids.tablist)

  const selector = `[role=tab][data-ownedby='${ids.tablist}']`

  const dom = createCollection(tablist, selector)
  return {
    ...dom,
    next(id: string) {
      return dom.next(ids.getTabId(id))
    },
    prev(id: string) {
      return dom.prev(ids.getTabId(id))
    },
    rectById(id: string) {
      const tab = dom.itemById(ids.getTabId(id))
      return {
        left: tab?.offsetLeft,
        width: tab?.offsetWidth,
      }
    },
  }
}
