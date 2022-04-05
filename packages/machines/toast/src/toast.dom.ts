import { GroupMachineContext as GroupCtx, MachineContext as Ctx, Placement } from "./toast.types"

export const dom = {
  getDoc: (ctx: Ctx | GroupCtx) => ctx.doc ?? document,

  getGroupId: (placement: Placement) => `toast-group--${placement}`,
  getContainerId: (ctx: Ctx) => `toast--${ctx.id}`,
  getTitleId: (ctx: Ctx) => `toast-title--${ctx.id}`,
  getCloseButtonId: (ctx: Ctx) => `toast-close-button--${ctx.id}`,

  getPortalId: (ctx: GroupCtx) => `toast-portal--${ctx.uid}`,
  getPortalEl: (ctx: GroupCtx) => dom.getDoc(ctx).getElementById(dom.getPortalId(ctx)),

  createPortalEl: (ctx: GroupCtx) => {
    const existing = dom.getPortalEl(ctx)
    if (existing) return existing
    const portal = dom.getDoc(ctx).createElement("toast-portal")
    portal.id = dom.getPortalId(ctx)
    return portal
  },
}
