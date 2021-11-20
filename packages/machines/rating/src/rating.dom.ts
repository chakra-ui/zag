import { dispatchInputEvent } from "@ui-machines/dom-utils"
import { RatingMachineContext as Ctx } from "./rating.machine"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getLabelId: (ctx: Ctx) => `rating-label-${ctx.uid}`,
  getInputId: (ctx: Ctx) => `rating-input-${ctx.uid}`,
  getRatingId: (ctx: Ctx, id: string | number) => `rating-star-${ctx.uid}-${id}`,
  getRootId: (ctx: Ctx) => `rating-${ctx.uid}`,
  getRootEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getRootId(ctx)),
  getRadioEl: (ctx: Ctx) =>
    dom.getRootEl(ctx)?.querySelector<HTMLElement>(`[role=radio][aria-posinset='${Math.ceil(ctx.value)}']`),
  getActiveEl: (ctx: Ctx) => dom.getDoc(ctx).activeElement,
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)),
  dispatchChangeEvent: (ctx: Ctx) => {
    const input = dom.getInputEl(ctx)
    if (input) dispatchInputEvent(input, ctx.value)
  },
}
