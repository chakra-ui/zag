import { createScope, query } from "@zag-js/dom-query"
import type { DateView, MachineContext as Ctx } from "./date-picker.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `datepicker:${ctx.id}`,
  getGridId: (ctx: Ctx, id: string) => `datepicker:${ctx.id}:grid:${id}`,
  getHeaderId: (ctx: Ctx) => `datepicker:${ctx.id}:header`,
  getContentId: (ctx: Ctx) => `datepicker:${ctx.id}:content`,
  getCellTriggerId: (ctx: Ctx, id: string) => `datepicker:${ctx.id}:cell-${id}`,
  getPrevTriggerId: (ctx: Ctx, view: DateView) => `datepicker:${ctx.id}:prev:${view}`,
  getNextTriggerId: (ctx: Ctx, view: DateView) => `datepicker:${ctx.id}:next:${view}`,
  getViewTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:view-trigger`,
  getClearTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:clear-trigger`,
  getControlId: (ctx: Ctx) => `datepicker:${ctx.id}:control`,
  getInputId: (ctx: Ctx) => `datepicker:${ctx.id}:input`,
  getTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:trigger`,
  getMonthSelectId: (ctx: Ctx) => `datepicker:${ctx.id}:month-select`,
  getYearSelectId: (ctx: Ctx) => `datepicker:${ctx.id}:year-select`,

  getFocusedCell: (ctx: Ctx, view = ctx.view) =>
    query(dom.getContentEl(ctx), `[data-part=cell-trigger][data-type=${view}][data-focused]`),
  getTriggerEl: (ctx: Ctx) => dom.getById<HTMLButtonElement>(ctx, dom.getTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
  getYearSelectEl: (ctx: Ctx) => dom.getById<HTMLSelectElement>(ctx, dom.getYearSelectId(ctx)),
  getMonthSelectEl: (ctx: Ctx) => dom.getById<HTMLSelectElement>(ctx, dom.getMonthSelectId(ctx)),
  getClearTriggerEl: (ctx: Ctx) => dom.getById<HTMLButtonElement>(ctx, dom.getClearTriggerId(ctx)),
})
