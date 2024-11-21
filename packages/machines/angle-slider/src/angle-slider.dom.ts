import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./angle-slider.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `angle-slider:${ctx.id}`,
  getThumbId: (ctx: Ctx) => ctx.ids?.thumb ?? `angle-slider:${ctx.id}:thumb`,
  getHiddenInputId: (ctx: Ctx) => ctx.ids?.hiddenInput ?? `angle-slider:${ctx.id}:input`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `angle-slider:${ctx.id}:control`,
  getValueTextId: (ctx: Ctx) => ctx.ids?.valueText ?? `angle-slider:${ctx.id}:value-text`,

  getHiddenInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getById<HTMLElement>(ctx, dom.getControlId(ctx)),
  getThumbEl: (ctx: Ctx) => dom.getById<HTMLElement>(ctx, dom.getThumbId(ctx)),
})
