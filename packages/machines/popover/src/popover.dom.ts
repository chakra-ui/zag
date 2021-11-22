import { getFocusables, getTabbables } from "@ui-machines/dom-utils"
import { cast, first, last, runIfFn } from "@ui-machines/utils"
import { PopoverMachineContext as Ctx } from "./popover.machine"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getTriggerId: (ctx: Ctx) => `popover-${ctx.uid}-trigger`,
  getContentId: (ctx: Ctx) => `popover-${ctx.uid}-content`,
  getHeaderId: (ctx: Ctx) => `popover-${ctx.uid}-header`,
  getBodyId: (ctx: Ctx) => `popover-${ctx.uid}-body`,
  getCloseButtonId: (ctx: Ctx) => `popover-${ctx.uid}-close-button`,

  getTriggerEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getContentId(ctx)),
  getHeaderEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getHeaderId(ctx)),
  getBodyEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getBodyId(ctx)),

  getFocusableEls: (ctx: Ctx) => getFocusables(dom.getContentEl(ctx)),
  getFirstFocusableEl: (ctx: Ctx) => dom.getFocusableEls(ctx)[0],

  getDocTabbableEls: (ctx: Ctx) => getTabbables(cast(dom.getDoc(ctx))),
  getTabbableEls: (ctx: Ctx) => {
    const el = dom.getContentEl(ctx)
    return el ? getTabbables(el) : []
  },
  getFirstTabbableEl: (ctx: Ctx) => first(dom.getTabbableEls(ctx)),
  getLastTabbableEl: (ctx: Ctx) => last(dom.getTabbableEls(ctx)),

  getInitialFocusEl: (ctx: Ctx) => {
    return runIfFn(ctx.initialFocusEl) ?? dom.getFirstFocusableEl(ctx)
  },
}
