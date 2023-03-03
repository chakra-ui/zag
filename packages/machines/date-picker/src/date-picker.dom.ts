import { createScope } from "@zag-js/dom-query"
import type { DateView, MachineContext as Ctx } from "./date-picker.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `datepicker:${ctx.id}`,
  getGridId: (ctx: Ctx, view: DateView) => `datepicker:${ctx.id}:grid:${view}`,
  getHeaderId: (ctx: Ctx) => `datepicker:${ctx.id}:header`,

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

  getGridEl: (ctx: Ctx, view = ctx.view) => dom.getById(ctx, dom.getGridId(ctx, view)),
  getFocusedCell: (ctx: Ctx, view = ctx.view) => {
    const grid = dom.getGridEl(ctx, view)
    return grid?.querySelector<HTMLElement>("[data-part=cell-trigger][data-focused]")
  },
  getYearSelectEl: (ctx: Ctx) => dom.getById<HTMLSelectElement>(ctx, dom.getYearSelectId(ctx)),
  getMonthSelectEl: (ctx: Ctx) => dom.getById<HTMLSelectElement>(ctx, dom.getMonthSelectId(ctx)),
})
