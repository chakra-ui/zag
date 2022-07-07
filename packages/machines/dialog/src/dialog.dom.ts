import { getRoots } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./dialog.types"

export const dom = {
  ...getRoots(),

  getUnderlayId: (ctx: Ctx) => ctx.ids?.underlay ?? `dialog:${ctx.id}:underlay`,
  getBackdropId: (ctx: Ctx) => ctx.ids?.backdrop ?? `dialog:${ctx.id}:backdrop`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `dialog:${ctx.id}:content`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `dialog:${ctx.id}:trigger`,
  getTitleId: (ctx: Ctx) => ctx.ids?.title ?? `dialog:${ctx.id}:title`,
  getDescriptionId: (ctx: Ctx) => ctx.ids?.description ?? `dialog:${ctx.id}:description`,
  getCloseButtonId: (ctx: Ctx) => ctx.ids?.closeBtn ?? `dialog:${ctx.id}:close-btn`,

  getContentEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getContentId(ctx)) as HTMLElement,
  getUnderlayEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getUnderlayId(ctx)) as HTMLElement,
  getTitleEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getTitleId(ctx)) as HTMLElement,
  getDescriptionEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getDescriptionId(ctx)) as HTMLElement,
}
