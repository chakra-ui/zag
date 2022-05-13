import { MachineContext as Ctx } from "./dialog.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getWin: (ctx: Ctx) => dom.getDoc(ctx).defaultView ?? window,
  getRootNode: (ctx: Ctx) => ctx.rootNode ?? dom.getDoc(ctx),

  getUnderlayId: (ctx: Ctx) => ctx.ids?.underlay ?? `dialog:${ctx.uid}:underlay`,
  getBackdropId: (ctx: Ctx) => ctx.ids?.backdrop ?? `dialog:${ctx.uid}:backdrop`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `dialog:${ctx.uid}:content`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `dialog:${ctx.uid}:trigger`,
  getTitleId: (ctx: Ctx) => ctx.ids?.title ?? `dialog:${ctx.uid}:title`,
  getDescriptionId: (ctx: Ctx) => ctx.ids?.description ?? `dialog:${ctx.uid}:description`,
  getCloseButtonId: (ctx: Ctx) => ctx.ids?.closeBtn ?? `dialog:${ctx.uid}:close-btn`,

  getContentEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getContentId(ctx)) as HTMLElement,
  getUnderlayEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getUnderlayId(ctx)) as HTMLElement,
  getTitleEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getTitleId(ctx)) as HTMLElement,
  getDescriptionEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getDescriptionId(ctx)) as HTMLElement,
}
