import { defineDomHelpers } from "@zag-js/dom-utils"
import type { Style } from "@zag-js/types"
import type { MachineContext as Ctx } from "./splitter.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `splitter:${ctx.id}`,
  getSplitterId: (ctx: Ctx) => ctx.ids?.splitter ?? `splitter:${ctx.id}:splitter`,
  getToggleButtonId: (ctx: Ctx) => ctx.ids?.toggleBtn ?? `splitter:${ctx.id}:toggle-btn`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `splitter:${ctx.id}:label`,
  getPrimaryPaneId: (ctx: Ctx) => ctx.ids?.primaryPane ?? `splitter:${ctx.id}:primary`,
  getSecondaryPaneId: (ctx: Ctx) => ctx.ids?.secondaryPane ?? `splitter:${ctx.id}:secondary`,

  getSplitterEl: (ctx: Ctx) => dom.getById(ctx, dom.getSplitterId(ctx)),
  getPrimaryPaneEl: (ctx: Ctx) => dom.getById(ctx, dom.getPrimaryPaneId(ctx)),

  getCursor(ctx: Ctx) {
    if (ctx.disabled || ctx.fixed) return "default"
    const x = ctx.isHorizontal
    let cursor: Style["cursor"] = x ? "col-resize" : "row-resize"
    if (ctx.isAtMin) cursor = x ? "e-resize" : "s-resize"
    if (ctx.isAtMax) cursor = x ? "w-resize" : "n-resize"
    return cursor
  },
})
