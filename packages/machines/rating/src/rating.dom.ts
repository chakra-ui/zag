import { dispatchInputEvent } from "@ui-machines/dom-utils"
import { MachineContext as Ctx } from "./rating.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => `rating-${ctx.uid}`,
  getLabelId: (ctx: Ctx) => `rating-${ctx.uid}-label`,
  getInputId: (ctx: Ctx) => `rating-${ctx.uid}-input`,
  getItemGroupId: (ctx: Ctx) => `rating-${ctx.uid}-item-group`,
  getItemId: (ctx: Ctx, id: string | number) => `rating-${ctx.uid}-star-${id}`,

  getItemGroupEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getItemGroupId(ctx)),
  getRadioEl: (ctx: Ctx) =>
    dom.getItemGroupEl(ctx)?.querySelector<HTMLElement>(`[role=radio][aria-posinset='${Math.ceil(ctx.value)}']`),
  getActiveEl: (ctx: Ctx) => dom.getDoc(ctx).activeElement,
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)),

  dispatchChangeEvent: (ctx: Ctx) => {
    const input = dom.getInputEl(ctx)
    if (input) dispatchInputEvent(input, ctx.value)
  },
}
