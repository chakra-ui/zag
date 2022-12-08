import { defineDomHelpers } from "@zag-js/dom-utils"
import type { GroupMachineContext as GroupCtx, MachineContext as Ctx, Placement } from "./toast.types"

export const dom = defineDomHelpers({
  getGroupId: (placement: Placement) => `toast-group:${placement}`,
  getRootId: (ctx: Ctx) => `toast:${ctx.id}`,
  getTitleId: (ctx: Ctx) => `toast:${ctx.id}:title`,
  getDescriptionId: (ctx: Ctx) => `toast:${ctx.id}:description`,
  getCloseTriggerId: (ctx: Ctx) => `toast${ctx.id}:close`,

  getPortalId: (ctx: GroupCtx) => `toast-portal:${ctx.id}`,
  // using `getDoc` instead of `getRootNode` since the portal is not a child of the root node
  getPortalEl: (ctx: GroupCtx) => dom.getDoc(ctx).getElementById(dom.getPortalId(ctx)),

  createPortalEl: (ctx: GroupCtx) => {
    const existing = dom.getPortalEl(ctx)
    if (existing) return existing
    const portal = dom.getDoc(ctx).createElement("toast-portal")
    portal.id = dom.getPortalId(ctx)
    return portal
  },
})
