import { DialogMachineContext as Ctx } from "./dialog.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getWin: (ctx: Ctx) => dom.getDoc(ctx).defaultView ?? window,
  getOverlayId: (ctx: Ctx) => `dialog-overlay-${ctx.uid}`,
  getContentId: (ctx: Ctx) => `modal-content-${ctx.uid}`,
  getTriggerId: (ctx: Ctx) => `modal-trigger-${ctx.uid}`,
  getTitleId: (ctx: Ctx) => `modal-title-${ctx.uid}`,
  getDescriptionId: (ctx: Ctx) => `modal-desc-${ctx.uid}`,
  getCloseButtonId: (ctx: Ctx) => `modal-close-btn-${ctx.uid}`,

  getContentEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getContentId(ctx)) as HTMLElement,
  getOverlayEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getOverlayId(ctx)) as HTMLElement,
  getTitleEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTitleId(ctx)) as HTMLElement,
  getDescriptionEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getDescriptionId(ctx)) as HTMLElement,
}
