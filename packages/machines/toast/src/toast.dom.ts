import { GroupMachineContext as GroupCtx, MachineContext as Ctx, Placement } from "./toast.types"

export const dom = {
  getDoc: (ctx: Ctx | GroupCtx) => ctx.doc ?? document,
  getGroupPortalId: (ctx: GroupCtx) => `toast-portal--${ctx.uid}`,
  getGroupId: (placement: Placement) => `toast-group--${placement}`,

  getToastTitleId: (ctx: Ctx) => `toast-title--${ctx.id}`,
  getRootId: (ctx: Ctx) => `toast--${ctx.id}`,
  getToastContainerId: (ctx: Ctx) => `toast-container--${ctx.id}`,
  getCloseButtonId: (ctx: Ctx) => `toast-close-button--${ctx.id}`,

  getPortalId: (ctx: GroupCtx) => `toast-portal--${ctx.uid}`,
  getPortalEl: (ctx: GroupCtx) => dom.getDoc(ctx).getElementById(dom.getPortalId(ctx)),
  createPortalEl: (ctx: GroupCtx) => {
    const portal = dom.getDoc(ctx).createElement("toast-portal")
    portal.id = dom.getPortalId(ctx)
    return portal
  },
}
