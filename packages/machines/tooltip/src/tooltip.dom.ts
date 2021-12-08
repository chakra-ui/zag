import { getScrollParent } from "@ui-machines/dom-utils"
import { MachineContext as Ctx } from "./tooltip.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc || document,
  getWin: (ctx: Ctx) => ctx.doc?.defaultView || window,

  getTriggerId: (ctx: Ctx) => `tooltip-${ctx.id}-trigger`,
  getTooltipId: (ctx: Ctx) => `tooltip-${ctx.id}-content`,
  portalId: "tooltip-portal",

  getTriggerEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTriggerId(ctx)),
  getTooltipEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTooltipId(ctx)),
  getScrollParent: (ctx: Ctx) => getScrollParent(dom.getTriggerEl(ctx)),
  getPortalEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.portalId),

  createPortalEl: (ctx: Ctx) => {
    const portal = dom.getDoc(ctx).createElement("tooltip-portal")
    portal.id = dom.portalId
    return portal
  },
}
