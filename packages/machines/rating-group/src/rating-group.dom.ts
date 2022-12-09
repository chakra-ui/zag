import { defineDomHelpers } from "@zag-js/dom-utils"
import { dispatchInputValueEvent } from "@zag-js/form-utils"
import type { MachineContext as Ctx } from "./rating-group.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `rating:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `rating:${ctx.id}:label`,
  getHiddenInputId: (ctx: Ctx) => ctx.ids?.hiddenInput ?? `rating:${ctx.id}:input`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `rating:${ctx.id}:control`,
  getRatingId: (ctx: Ctx, id: string) => ctx.ids?.rating?.(id) ?? `rating:${ctx.id}:star:${id}`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getRadioEl: (ctx: Ctx) =>
    dom.getControlEl(ctx)?.querySelector<HTMLElement>(`[role=radio][aria-posinset='${Math.ceil(ctx.value)}']`),
  getActiveEl: (ctx: Ctx) => dom.getRootNode(ctx).activeElement,
  getHiddenInputEl: (ctx: Ctx) => dom.getById(ctx, dom.getHiddenInputId(ctx)),

  dispatchChangeEvent: (ctx: Ctx) => {
    const hiddenInput = dom.getHiddenInputEl(ctx)
    if (hiddenInput) dispatchInputValueEvent(hiddenInput, ctx.value)
  },
})
