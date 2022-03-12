import { MachineContext as Ctx } from "./dialog.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getWin: (ctx: Ctx) => dom.getDoc(ctx).defaultView ?? window,
  getUnderlayId: (ctx: Ctx) => `dialog-underlay-${ctx.uid}`,
  getBackdropId: (ctx: Ctx) => `dialog-backdrop-${ctx.uid}`,
  getContentId: (ctx: Ctx) => `dialog-content-${ctx.uid}`,
  getTriggerId: (ctx: Ctx) => `dialog-trigger-${ctx.uid}`,
  getTitleId: (ctx: Ctx) => `dialog-title-${ctx.uid}`,
  getDescriptionId: (ctx: Ctx) => `dialog-desc-${ctx.uid}`,
  getCloseButtonId: (ctx: Ctx) => `dialog-close-btn-${ctx.uid}`,

  getContentEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getContentId(ctx)) as HTMLElement,
  getUnderlayEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getUnderlayId(ctx)) as HTMLElement,
  getTitleEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTitleId(ctx)) as HTMLElement,
  getDescriptionEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getDescriptionId(ctx)) as HTMLElement,
}
