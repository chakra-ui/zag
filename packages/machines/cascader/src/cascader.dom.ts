import { createScope, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./cascader.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `cascader:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `cascader:${ctx.id}:label`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `cascader:${ctx.id}:control`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `cascader:${ctx.id}:trigger`,
  getClearTriggerId: (ctx: Ctx) => ctx.ids?.clearTrigger ?? `cascader:${ctx.id}:clear-trigger`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `cascader:${ctx.id}:positioner`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `cascader:${ctx.id}:content`,
  getListId: (ctx: Ctx, value: string) => ctx.ids?.list?.(value) ?? `cascader:${ctx.id}:list:${value}`,
  getItemId: (ctx: Ctx, value: string) => ctx.ids?.item?.(value) ?? `cascader:${ctx.id}:item:${value}`,

  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getClearTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),

  getListEls: (ctx: Ctx) => queryAll(dom.getContentEl(ctx), `[data-part=list]`),
})
