import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./date-picker.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `datepicker:${ctx.id}`,
  getGridId: (ctx: Ctx) => `datepicker:${ctx.id}:grid`,
  getHeaderId: (ctx: Ctx) => `datepicker:${ctx.id}:header`,

  getCellTriggerId: (ctx: Ctx, id: string) => `datepicker:${ctx.id}:cell-${id}`,
  getPrevTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:prev-trigger`,
  getNextTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:next-trigger`,
  getViewTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:view-trigger`,
  getClearTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:clear-trigger`,

  getControlId: (ctx: Ctx) => `datepicker:${ctx.id}:control`,
  getInputId: (ctx: Ctx) => `datepicker:${ctx.id}:input`,
  getTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:trigger`,

  getMonthSelectId: (ctx: Ctx) => `datepicker:${ctx.id}:month-select`,
  getYearSelectId: (ctx: Ctx) => `datepicker:${ctx.id}:year-select`,

  getGridEl: (ctx: Ctx) => dom.getById(ctx, dom.getGridId(ctx)),
  getFocusedCell: (ctx: Ctx) => {
    const grid = dom.getGridEl(ctx)
    return grid?.querySelector<HTMLElement>("[data-part=cell-trigger][data-focused]")
  },
})
