import { queryElements } from "@ui-machines/dom-utils"
import { PinInputMachineContext as Ctx } from "./pin-input.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => `pin-input-${ctx.uid}`,
  getInputId: (ctx: Ctx, id: string | number) => `pin-input-${ctx.uid}-${id}`,

  getRootEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getRootId(ctx)),
  getElements: (ctx: Ctx) =>
    queryElements<HTMLInputElement>(dom.getRootEl(ctx), `input[data-ownedby=${dom.getRootId(ctx)}]`),
  getFocusedEl: (ctx: Ctx) => dom.getElements(ctx)[ctx.focusedIndex],

  getFirstInputEl: (ctx: Ctx) => dom.getElements(ctx)[0],
}
