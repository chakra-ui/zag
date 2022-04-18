import { Style } from "@zag-js/types"
import { MachineContext as Ctx } from "./splitter.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `splitter:${ctx.uid}`,
  getSplitterId: (ctx: Ctx) => ctx.ids?.splitter ?? `splitter:${ctx.uid}:splitter`,
  getToggleButtonId: (ctx: Ctx) => ctx.ids?.toggleBtn ?? `splitter:${ctx.uid}:toggle-btn`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `splitter:${ctx.uid}:label`,
  getPrimaryPaneId: (ctx: Ctx) => ctx.ids?.primaryPane ?? `splitter:${ctx.uid}:primary`,
  getSecondaryPaneId: (ctx: Ctx) => ctx.ids?.secondaryPane ?? `splitter:${ctx.uid}:secondary`,

  getSplitterEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getSplitterId(ctx)),
  getPrimaryPaneEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getPrimaryPaneId(ctx)),

  getCursor(ctx: Ctx) {
    if (ctx.disabled || ctx.fixed) return "default"
    const x = ctx.isHorizontal
    let cursor: Style["cursor"] = x ? "col-resize" : "row-resize"
    if (ctx.isAtMin) cursor = x ? "e-resize" : "s-resize"
    if (ctx.isAtMax) cursor = x ? "w-resize" : "n-resize"
    return cursor
  },
}
