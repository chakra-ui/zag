import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./switch.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `checkbox:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `checkbox:${ctx.id}:label`,
  getThumbId: (ctx: Ctx) => ctx.ids?.thumb ?? `checkbox:${ctx.id}:thumb`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `checkbox:${ctx.id}:control`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `checkbox:${ctx.id}:input`,

  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
})
