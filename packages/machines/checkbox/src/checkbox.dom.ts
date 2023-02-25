import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./checkbox.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `checkbox:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `checkbox:${ctx.id}:label`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `checkbox:${ctx.id}:control`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `checkbox:${ctx.id}:input`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
})
