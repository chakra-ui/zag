import { createScope, getFocusables } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./popover.types"

export const dom = createScope({
  getAnchorId: (ctx: Ctx) => ctx.ids?.anchor ?? `popover:${ctx.id}:anchor`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `popover:${ctx.id}:trigger`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `popover:${ctx.id}:content`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `popover:${ctx.id}:popper`,
  getArrowId: (ctx: Ctx) => ctx.ids?.arrow ?? `popover:${ctx.id}:arrow`,
  getTitleId: (ctx: Ctx) => ctx.ids?.title ?? `popover:${ctx.id}:title`,
  getDescriptionId: (ctx: Ctx) => ctx.ids?.description ?? `popover:${ctx.id}:desc`,
  getCloseTriggerId: (ctx: Ctx) => ctx.ids?.closeTrigger ?? `popover:${ctx.id}:close`,

  getAnchorEl: (ctx: Ctx) => dom.getById(ctx, dom.getAnchorId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getTitleEl: (ctx: Ctx) => dom.getById(ctx, dom.getTitleId(ctx)),
  getDescriptionEl: (ctx: Ctx) => dom.getById(ctx, dom.getDescriptionId(ctx)),

  getFocusableEls: (ctx: Ctx) => getFocusables(dom.getContentEl(ctx)),
  getFirstFocusableEl: (ctx: Ctx) => dom.getFocusableEls(ctx)[0],
})
