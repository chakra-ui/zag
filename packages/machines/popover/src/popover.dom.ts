import { getFocusables, getTabbables } from "@zag-js/dom-utils"
import { cast, first, last, runIfFn } from "@zag-js/utils"
import { MachineContext as Ctx } from "./popover.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getActiveEl: (ctx: Ctx) => dom.getDoc(ctx).activeElement,

  getAnchorId: (ctx: Ctx) => ctx.ids?.anchor ?? `popover-${ctx.uid}-anchor`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `popover-${ctx.uid}-trigger`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `popover-${ctx.uid}-content`,
  getPositionerId: (ctx: Ctx) => `popover-${ctx.uid}-popper`,
  getArrowId: (ctx: Ctx) => `popover-${ctx.uid}-arrow`,
  getTitleId: (ctx: Ctx) => ctx.ids?.title ?? `popover-${ctx.uid}-title`,
  getDescriptionId: (ctx: Ctx) => ctx.ids?.description ?? `popover-${ctx.uid}-desc`,
  getCloseButtonId: (ctx: Ctx) => ctx.ids?.closeBtn ?? `popover-${ctx.uid}-close-button`,

  getAnchorEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getAnchorId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getContentId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getPositionerId(ctx)),
  getTitleEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTitleId(ctx)),
  getDescriptionEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getDescriptionId(ctx)),

  getFocusableEls: (ctx: Ctx) => getFocusables(dom.getContentEl(ctx)),
  getFirstFocusableEl: (ctx: Ctx) => dom.getFocusableEls(ctx)[0],

  getDocTabbableEls: (ctx: Ctx) => getTabbables(cast(dom.getDoc(ctx))),
  getTabbableEls: (ctx: Ctx) => {
    const el = dom.getContentEl(ctx)
    return el ? getTabbables(el) : []
  },
  getFirstTabbableEl: (ctx: Ctx) => first(dom.getTabbableEls(ctx)),
  getLastTabbableEl: (ctx: Ctx) => last(dom.getTabbableEls(ctx)),
  getInitialFocusEl: (ctx: Ctx) => runIfFn(ctx.initialFocusEl) ?? dom.getFirstFocusableEl(ctx),
}
