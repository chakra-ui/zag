import { createScope, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./bottom-sheet.types"

export const dom = createScope({
  getContentId: (ctx: Ctx) => `bottom-sheet:${ctx.id}:content`,
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getScrollEls: (ctx: Ctx) => {
    const els: Record<"x" | "y", HTMLElement[]> = { x: [], y: [] }

    const contentEl = dom.getContentEl(ctx)
    if (!contentEl) return els

    const nodes = queryAll(contentEl, "*")
    nodes.forEach((node) => {
      const y = node.scrollHeight > node.clientHeight
      if (y) els.y.push(node)

      const x = node.scrollWidth > node.clientWidth
      if (x) els.x.push(node)
    })

    return els
  },
})
