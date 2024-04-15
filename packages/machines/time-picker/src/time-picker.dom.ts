import { createScope, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./time-picker.types"

export const dom = createScope({
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `time-picker:${ctx.id}:content`,
  getContentColumnId: (ctx: Ctx) => ctx.ids?.contentColumn ?? `time-picker:${ctx.id}:content-column`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `time-picker:${ctx.id}:control`,
  getClearTriggerId: (ctx: Ctx) => ctx.ids?.clearTrigger ?? `time-picker:${ctx.id}:clear-trigger`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `time-picker:${ctx.id}:positioner`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `time-picker:${ctx.id}:input`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `time-picker:${ctx.id}:trigger`,

  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getContentColumnEls: (ctx: Ctx) => queryAll(dom.getContentEl(ctx), `[data-part=content-column]`),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getClearTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
  getHourCellEls: (ctx: Ctx) => queryAll(dom.getContentEl(ctx), `[data-part=hour-cell]`),
  getMinuteCellEls: (ctx: Ctx) => queryAll(dom.getContentEl(ctx), `[data-part=minute-cell]`),
  getSecondCellEls: (ctx: Ctx) => queryAll(dom.getContentEl(ctx), `[data-part=second-cell]`),
  getPeriodCellEls: (ctx: Ctx) => queryAll(dom.getContentEl(ctx), `[data-part=period-cell]`),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
})
