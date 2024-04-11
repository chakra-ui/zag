import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./time-picker.types"

export const dom = createScope({
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `time-picker:${ctx.id}:content`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `time-picker:${ctx.id}:control`,
  getClearTriggerId: (ctx: Ctx) => ctx.ids?.clearTrigger ?? `time-picker:${ctx.id}:clear-trigger`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `time-picker:${ctx.id}:positioner`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `time-picker:${ctx.id}:input`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `time-picker:${ctx.id}:trigger`,

  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getClearTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
})
