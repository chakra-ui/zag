import { Style } from "@ui-machines/types"
import { MachineContext as Ctx } from "./split-view.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootId: (ctx: Ctx) => `${ctx.uid}-root`,
  getSplitterId: (ctx: Ctx) => `${ctx.uid}-splitter`,
  getToggleButtonId: (ctx: Ctx) => `${ctx.uid}-toggle-button`,
  getSplitterLabelId: (ctx: Ctx) => `${ctx.uid}-splitter-label`,
  getPrimaryPaneId: (ctx: Ctx) => `${ctx.uid}-primary-pane`,
  getSecondaryPaneId: (ctx: Ctx) => `${ctx.uid}-secondary-pane`,

  getSplitterEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getSplitterId(ctx)),
  getPrimaryPaneEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getPrimaryPaneId(ctx)),

  getCursor(ctx: Ctx) {
    const x = ctx.isHorizontal
    let cursor: Style["cursor"] = x ? "col-resize" : "row-resize"
    if (ctx.isAtMin) cursor = x ? "e-resize" : "s-resize"
    if (ctx.isAtMax) cursor = x ? "w-resize" : "n-resize"
    return cursor
  },
}
