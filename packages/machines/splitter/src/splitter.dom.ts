import { Style } from "@zag-js/types"
import { MachineContext as Ctx } from "./splitter.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `${ctx.uid}-root`,
  getSplitterId: (ctx: Ctx) => ctx.ids?.splitter ?? `${ctx.uid}-splitter`,
  getToggleButtonId: (ctx: Ctx) => ctx.ids?.toggleBtn ?? `${ctx.uid}-toggle-button`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `${ctx.uid}-splitter-label`,
  getPrimaryPaneId: (ctx: Ctx) => ctx.ids?.primaryPane ?? `${ctx.uid}-primary-pane`,
  getSecondaryPaneId: (ctx: Ctx) => ctx.ids?.secondaryPane ?? `${ctx.uid}-secondary-pane`,

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
