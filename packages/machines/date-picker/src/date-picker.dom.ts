import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./date-picker.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `datepicker:${ctx.id}`,
  getGridId: (ctx: Ctx) => `datepicker:${ctx.id}:grid`,
  getCellId: (ctx: Ctx, id: string) => `datepicker:${ctx.id}:cell-${id}`,
  getCellTriggerId: (ctx: Ctx, id: string) => `datepicker:${ctx.id}:cell-trigger-${id}`,
  getPrevTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:prev-trigger`,
  getNextTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:next-trigger`,
  getControlId: (ctx: Ctx) => `datepicker:${ctx.id}:control`,
  getTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:trigger`,
  getInputId: (ctx: Ctx) => `datepicker:${ctx.id}:input`,
  getClearTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:clear-trigger`,
  getGridEl: (ctx: Ctx) => dom.getById(ctx, dom.getGridId(ctx)),
  getFocusedCell: (ctx: Ctx) => {
    const grid = dom.getGridEl(ctx)
    return grid?.querySelector<HTMLElement>("[data-part=cell-trigger][data-focused]")
  },
})
