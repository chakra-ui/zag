import { MachineContext as Ctx } from "./dialog.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getWin: (ctx: Ctx) => dom.getDoc(ctx).defaultView ?? window,

  getUnderlayId: (ctx: Ctx) => ctx.ids?.underlay ?? `dialog-underlay-${ctx.uid}`,
  getBackdropId: (ctx: Ctx) => ctx.ids?.backdrop ?? `dialog-backdrop-${ctx.uid}`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `dialog-content-${ctx.uid}`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `dialog-trigger-${ctx.uid}`,
  getTitleId: (ctx: Ctx) => ctx.ids?.title ?? `dialog-title-${ctx.uid}`,
  getDescriptionId: (ctx: Ctx) => ctx.ids?.description ?? `dialog-desc-${ctx.uid}`,
  getCloseButtonId: (ctx: Ctx) => ctx.ids?.closeBtn ?? `dialog-close-btn-${ctx.uid}`,

  getContentEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getContentId(ctx)) as HTMLElement,
  getUnderlayEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getUnderlayId(ctx)) as HTMLElement,
  getTitleEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTitleId(ctx)) as HTMLElement,
  getDescriptionEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getDescriptionId(ctx)) as HTMLElement,
}
