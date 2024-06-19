import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./editable.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `editable:${ctx.id}`,
  getAreaId: (ctx: Ctx) => ctx.ids?.area ?? `editable:${ctx.id}:area`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `editable:${ctx.id}:label`,
  getPreviewId: (ctx: Ctx) => ctx.ids?.preview ?? `editable:${ctx.id}:preview`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `editable:${ctx.id}:input`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `editable:${ctx.id}:control`,
  getSubmitTriggerId: (ctx: Ctx) => ctx.ids?.submitTrigger ?? `editable:${ctx.id}:submit`,
  getCancelTriggerId: (ctx: Ctx) => ctx.ids?.cancelTrigger ?? `editable:${ctx.id}:cancel`,
  getEditTriggerId: (ctx: Ctx) => ctx.ids?.editTrigger ?? `editable:${ctx.id}:edit`,

  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
  getPreviewEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getPreviewId(ctx)),
  getSubmitTriggerEl: (ctx: Ctx) => dom.getById<HTMLButtonElement>(ctx, dom.getSubmitTriggerId(ctx)),
  getCancelTriggerEl: (ctx: Ctx) => dom.getById<HTMLButtonElement>(ctx, dom.getCancelTriggerId(ctx)),
  getEditTriggerEl: (ctx: Ctx) => dom.getById<HTMLButtonElement>(ctx, dom.getEditTriggerId(ctx)),
})
