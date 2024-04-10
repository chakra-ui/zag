import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./time-picker.types"

export const dom = createScope({
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `time-picker:${ctx.id}:positioner`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `time-picker:${ctx.id}:input`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `time-picker:${ctx.id}:trigger`,

  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
})
