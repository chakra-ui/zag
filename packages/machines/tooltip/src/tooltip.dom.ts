import { getScrollParent } from "@ui-machines/dom-utils"
import { MachineContext as Ctx } from "./tooltip.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc || document,
  getWin: (ctx: Ctx) => ctx.doc?.defaultView || window,

  getTriggerId: (ctx: Ctx) => `tooltip-${ctx.id}--trigger`,
  getContentId: (ctx: Ctx) => `tooltip-${ctx.id}--content`,
  getArrowId: (ctx: Ctx) => `tooltip-${ctx.id}--arrow`,
  getPositionerId: (ctx: Ctx) => `tooltip-${ctx.id}--popper`,
  portalId: "tooltip-portal",

  getTriggerEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getContentId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getPositionerId(ctx)),
  getArrowEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getArrowId(ctx)),
  getScrollParent: (ctx: Ctx) => getScrollParent(dom.getTriggerEl(ctx)!),
  getPortalEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.portalId),

  createPortalEl: (ctx: Ctx) => {
    const portal = dom.getDoc(ctx).createElement("tooltip-portal")
    portal.id = dom.portalId
    return portal
  },
}
