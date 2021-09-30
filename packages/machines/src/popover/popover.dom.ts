import { getFocusables } from "tiny-dom-query/focusable"
import { PopoverMachineContext as Ctx } from "./popover.machine"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getTriggerId: (ctx: Ctx) => `popover-${ctx.uid}-trigger`,
  getContentId: (ctx: Ctx) => `popover-${ctx.uid}-content`,
  getHeaderId: (ctx: Ctx) => `popover-${ctx.uid}-header`,
  getBodyId: (ctx: Ctx) => `popover-${ctx.uid}-body`,

  getTriggerEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getContentId(ctx)),
  getHeaderEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getHeaderId(ctx)),
  getBodyEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getBodyId(ctx)),

  getFocusableEls: (ctx: Ctx) => getFocusables(dom.getContentEl(ctx)),
  getFirstFocusableEl: (ctx: Ctx) => dom.getFocusableEls(ctx)[0],
}
