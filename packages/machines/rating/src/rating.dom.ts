import { dispatchInputValueEvent, defineDomHelpers } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./rating.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `rating:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `rating:${ctx.id}:label`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `rating:${ctx.id}:input`,
  getItemGroupId: (ctx: Ctx) => ctx.ids?.itemGroup ?? `rating:${ctx.id}:item-group`,
  getItemId: (ctx: Ctx, id: string) => ctx.ids?.item?.(id) ?? `rating:${ctx.id}:star:${id}`,

  getItemGroupEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getItemGroupId(ctx)),
  getRadioEl: (ctx: Ctx) =>
    dom.getItemGroupEl(ctx)?.querySelector<HTMLElement>(`[role=radio][aria-posinset='${Math.ceil(ctx.value)}']`),
  getActiveEl: (ctx: Ctx) => dom.getRootNode(ctx).activeElement,
  getInputEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getInputId(ctx)),

  dispatchChangeEvent: (ctx: Ctx) => {
    const input = dom.getInputEl(ctx)
    if (input) dispatchInputValueEvent(input, ctx.value)
  },
})
