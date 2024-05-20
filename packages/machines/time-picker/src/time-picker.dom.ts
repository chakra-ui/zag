import { createScope, query, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx, TimeUnit } from "./time-picker.types"

export const dom = createScope({
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `time-picker:${ctx.id}:content`,
  getColumnId: (ctx: Ctx, unit: TimeUnit) => ctx.ids?.column?.(unit) ?? `time-picker:${ctx.id}:column:${unit}`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `time-picker:${ctx.id}:control`,
  getClearTriggerId: (ctx: Ctx) => ctx.ids?.clearTrigger ?? `time-picker:${ctx.id}:clear-trigger`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `time-picker:${ctx.id}:positioner`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `time-picker:${ctx.id}:input`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `time-picker:${ctx.id}:trigger`,

  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getColumnEl: (ctx: Ctx, unit: TimeUnit) => query(dom.getContentEl(ctx), `[data-part=column][data-unit=${unit}]`),
  getColumnEls: (ctx: Ctx) => queryAll(dom.getContentEl(ctx), `[data-part=column]:not([hidden])`),
  getColumnCellEls: (ctx: Ctx, unit: TimeUnit) => queryAll(dom.getColumnEl(ctx, unit), `[data-part=cell]`),

  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getClearTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),

  getFocusedCell: (ctx: Ctx) => query(dom.getContentEl(ctx), `[data-part=cell][data-focus]`),
  getInitialFocusCell: (ctx: Ctx, unit: TimeUnit): HTMLElement | null => {
    const contentEl = dom.getContentEl(ctx)
    let cellEl = query(contentEl, `[data-part=cell][data-unit=${unit}][aria-current]`)
    cellEl ||= query(contentEl, `[data-part=cell][data-unit=${unit}][data-now]`)
    cellEl ||= query(contentEl, `[data-part=cell][data-unit=${unit}]`)
    return cellEl
  },

  getColumnUnit: (el: HTMLElement): TimeUnit => el.dataset.unit as TimeUnit,
  getCellValue: (el: HTMLElement | null): any => {
    const value = el?.dataset.value
    return el?.dataset.unit === "period" ? value : Number(value ?? "0")
  },
})
