import { defineDomHelpers } from "@zag-js/dom-utils"
import { dispatchInputValueEvent } from "@zag-js/form-utils"
import type { MachineContext as Ctx } from "./rating-group.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `rating:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `rating:${ctx.id}:label`,
  getHiddenInputId: (ctx: Ctx) => ctx.ids?.hiddenInput ?? `rating:${ctx.id}:hiddenInput`,
  getItemGroupId: (ctx: Ctx) => ctx.ids?.itemGroup ?? `rating:${ctx.id}:item-group`,
  getItemId: (ctx: Ctx, id: string) => ctx.ids?.item?.(id) ?? `rating:${ctx.id}:star:${id}`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getItemGroupEl: (ctx: Ctx) => dom.getById(ctx, dom.getItemGroupId(ctx)),
  getRadioEl: (ctx: Ctx) =>
    dom.getItemGroupEl(ctx)?.querySelector<HTMLElement>(`[role=radio][aria-posinset='${Math.ceil(ctx.value)}']`),
  getActiveEl: (ctx: Ctx) => dom.getRootNode(ctx).activeElement,
  getHiddenInputEl: (ctx: Ctx) => dom.getById(ctx, dom.getHiddenInputId(ctx)),

  dispatchChangeEvent: (ctx: Ctx) => {
    const hiddenInput = dom.getHiddenInputEl(ctx)
    if (hiddenInput) dispatchInputValueEvent(hiddenInput, ctx.value)
  },
})
