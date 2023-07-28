import { createScope, query } from "@zag-js/dom-query"
import type { DateView, MachineContext as Ctx } from "./date-picker.types"

export const dom = createScope({
  getGridId: (ctx: Ctx, id: string) => ctx.ids?.grid?.(id) ?? `datepicker:${ctx.id}:grid:${id}`,
  getHeaderId: (ctx: Ctx) => ctx.ids?.header ?? `datepicker:${ctx.id}:header`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `datepicker:${ctx.id}:content`,
  getCellTriggerId: (ctx: Ctx, id: string) => ctx.ids?.cellTrigger?.(id) ?? `datepicker:${ctx.id}:cell-trigger:${id}`,
  getPrevTriggerId: (ctx: Ctx, view: DateView) => ctx.ids?.prevTrigger?.(view) ?? `datepicker:${ctx.id}:prev:${view}`,
  getNextTriggerId: (ctx: Ctx, view: DateView) => ctx.ids?.nextTrigger?.(view) ?? `datepicker:${ctx.id}:next:${view}`,
  getViewTriggerId: (ctx: Ctx, view: DateView) => ctx.ids?.viewTrigger?.(view) ?? `datepicker:${ctx.id}:view:${view}`,
  getClearTriggerId: (ctx: Ctx) => ctx.ids?.clearTrigger ?? `datepicker:${ctx.id}:clear`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `datepicker:${ctx.id}:control`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `datepicker:${ctx.id}:input`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `datepicker:${ctx.id}:trigger`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `datepicker:${ctx.id}:positioner`,
  getMonthSelectId: (ctx: Ctx) => ctx.ids?.monthSelect ?? `datepicker:${ctx.id}:month-select`,
  getYearSelectId: (ctx: Ctx) => ctx.ids?.yearSelect ?? `datepicker:${ctx.id}:year-select`,

  getFocusedCell: (ctx: Ctx, view = ctx.view) =>
    query(dom.getContentEl(ctx), `[data-part=cell-trigger][data-type=${view}][data-focused]:not([data-outside-range])`),
  getTriggerEl: (ctx: Ctx) => dom.getById<HTMLButtonElement>(ctx, dom.getTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
  getYearSelectEl: (ctx: Ctx) => dom.getById<HTMLSelectElement>(ctx, dom.getYearSelectId(ctx)),
  getMonthSelectEl: (ctx: Ctx) => dom.getById<HTMLSelectElement>(ctx, dom.getMonthSelectId(ctx)),
  getClearTriggerEl: (ctx: Ctx) => dom.getById<HTMLButtonElement>(ctx, dom.getClearTriggerId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
})
