import { dispatchInputValueEvent } from "@zag-js/dom-utils"
import { MachineContext as Ctx } from "./rating.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `rating:${ctx.uid}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `rating:${ctx.uid}:label`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `rating:${ctx.uid}:input`,
  getItemGroupId: (ctx: Ctx) => ctx.ids?.itemGroup ?? `rating:${ctx.uid}:item-group`,
  getItemId: (ctx: Ctx, id: string) => ctx.ids?.item?.(id) ?? `rating:${ctx.uid}:star:${id}`,

  getItemGroupEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getItemGroupId(ctx)),
  getRadioEl: (ctx: Ctx) =>
    dom.getItemGroupEl(ctx)?.querySelector<HTMLElement>(`[role=radio][aria-posinset='${Math.ceil(ctx.value)}']`),
  getActiveEl: (ctx: Ctx) => dom.getDoc(ctx).activeElement,
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)),

  dispatchChangeEvent: (ctx: Ctx) => {
    const input = dom.getInputEl(ctx)
    if (input) dispatchInputValueEvent(input, ctx.value)
  },
}
