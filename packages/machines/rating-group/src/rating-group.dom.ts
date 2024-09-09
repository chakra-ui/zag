import { createScope, query } from "@zag-js/dom-query"
import { dispatchInputValueEvent } from "@zag-js/form-utils"
import type { MachineContext as Ctx } from "./rating-group.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `rating:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `rating:${ctx.id}:label`,
  getHiddenInputId: (ctx: Ctx) => ctx.ids?.hiddenInput ?? `rating:${ctx.id}:input`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `rating:${ctx.id}:control`,
  getItemId: (ctx: Ctx, id: string) => ctx.ids?.item?.(id) ?? `rating:${ctx.id}:item:${id}`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getRadioEl: (ctx: Ctx, value = ctx.value) => {
    const selector = `[role=radio][aria-posinset='${Math.ceil(value)}']`
    return query(dom.getControlEl(ctx), selector)
  },

  getHiddenInputEl: (ctx: Ctx) => dom.getById(ctx, dom.getHiddenInputId(ctx)),

  dispatchChangeEvent: (ctx: Ctx) => {
    const inputEl = dom.getHiddenInputEl(ctx)
    if (!inputEl) return
    dispatchInputValueEvent(inputEl, { value: ctx.value })
  },
})
