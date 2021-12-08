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
}
