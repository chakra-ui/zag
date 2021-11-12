import { getScrollParent } from "tiny-dom-query/scrollable"
import { TooltipMachineContext as Ctx } from "./tooltip.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc || document,
  getWin: (ctx: Ctx) => ctx.doc?.defaultView || window,

  getTriggerId: (ctx: Ctx) => `tooltip-${ctx.id}-trigger`,
  getTooltipId: (ctx: Ctx) => `tooltip-${ctx.id}-content`,

  getTriggerEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTriggerId(ctx)),
  getTooltipEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTooltipId(ctx)),
  getScrollParent: (ctx: Ctx) => getScrollParent(dom.getTriggerEl(ctx)),
}
