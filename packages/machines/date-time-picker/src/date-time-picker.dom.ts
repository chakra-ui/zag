import { createScope, query, queryAll } from "@zag-js/dom-query"
import type { DateView, MachineContext as Ctx } from "./date-time-picker.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `datetimepicker:${ctx.id}`,
  getTableId: (ctx: Ctx, id: string) => ctx.ids?.table?.(id) ?? `datetimepicker:${ctx.id}:table:${id}`,
  getTableHeaderId: (ctx: Ctx, id: string) => ctx.ids?.tableHeader?.(id) ?? `datetimepicker:${ctx.id}:thead`,
  getTableBodyId: (ctx: Ctx, id: string) => ctx.ids?.tableBody?.(id) ?? `datetimepicker:${ctx.id}:tbody`,
  getTableRowId: (ctx: Ctx, id: string) => ctx.ids?.tableRow?.(id) ?? `datetimepicker:${ctx.id}:tr:${id}`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `datetimepicker:${ctx.id}:content`,
  getCellTriggerId: (ctx: Ctx, id: string) =>
    ctx.ids?.cellTrigger?.(id) ?? `datetimepicker:${ctx.id}:cell-trigger:${id}`,
  getPrevTriggerId: (ctx: Ctx, view: DateView) =>
    ctx.ids?.prevTrigger?.(view) ?? `datetimepicker:${ctx.id}:prev:${view}`,
  getNextTriggerId: (ctx: Ctx, view: DateView) =>
    ctx.ids?.nextTrigger?.(view) ?? `datetimepicker:${ctx.id}:next:${view}`,
  getViewTriggerId: (ctx: Ctx, view: DateView) =>
    ctx.ids?.viewTrigger?.(view) ?? `datetimepicker:${ctx.id}:view:${view}`,
  getClearTriggerId: (ctx: Ctx) => ctx.ids?.clearTrigger ?? `datetimepicker:${ctx.id}:clear`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `datetimepicker:${ctx.id}:control`,
  getInputId: (ctx: Ctx, index: number) => ctx.ids?.input?.(index) ?? `datetimepicker:${ctx.id}:input:${index}`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `datetimepicker:${ctx.id}:trigger`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `datetimepicker:${ctx.id}:positioner`,
  getMonthSelectId: (ctx: Ctx) => ctx.ids?.monthSelect ?? `datetimepicker:${ctx.id}:month-select`,
  getYearSelectId: (ctx: Ctx) => ctx.ids?.yearSelect ?? `datetimepicker:${ctx.id}:year-select`,

  getFocusedCell: (ctx: Ctx, view = ctx.view) =>
    query(
      dom.getContentEl(ctx),
      `[data-part=table-cell-trigger][data-view=${view}][data-focused]:not([data-outside-range])`,
    ),
  getTriggerEl: (ctx: Ctx) => dom.getById<HTMLButtonElement>(ctx, dom.getTriggerId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getInputEls: (ctx: Ctx) => queryAll<HTMLInputElement>(dom.getControlEl(ctx), `[data-part=input]`),
  getYearSelectEl: (ctx: Ctx) => dom.getById<HTMLSelectElement>(ctx, dom.getYearSelectId(ctx)),
  getMonthSelectEl: (ctx: Ctx) => dom.getById<HTMLSelectElement>(ctx, dom.getMonthSelectId(ctx)),
  getClearTriggerEl: (ctx: Ctx) => dom.getById<HTMLButtonElement>(ctx, dom.getClearTriggerId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
})
