import { createScope, getByTypeahead } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./tree-view.types"
import { getVisibleNodes } from "./tree-view.utils"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `tree:${ctx.id}:root`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `tree:${ctx.id}:label`,
  getNodeId: (ctx: Ctx, value: string) => ctx.ids?.node?.(value) ?? `tree:${ctx.id}:node:${value}`,
  getTreeId: (ctx: Ctx) => ctx.ids?.tree ?? `tree:${ctx.id}:tree`,
  getTreeEl: (ctx: Ctx) => dom.getById(ctx, dom.getTreeId(ctx)),
  focusNode: (ctx: Ctx, value: string | null | undefined) => {
    if (value == null) return
    const nodeId = dom.getNodeId(ctx, value)
    dom.getById(ctx, nodeId)?.focus({ preventScroll: true })
  },
  getMatchingNode(ctx: Ctx, key: string) {
    const nodes = getVisibleNodes(ctx)
    const elements = nodes.map(({ node }) => ({
      textContent: ctx.collection.stringifyNode(node),
      id: ctx.collection.getNodeValue(node),
    }))
    return getByTypeahead(elements, {
      state: ctx.typeaheadState,
      key,
      activeId: ctx.focusedValue,
    })
  },
})
