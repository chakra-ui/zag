import { queryElements } from "tiny-nodelist"
import { PinInputMachineContext as Ctx } from "./pin-input.types"

export const dom = {
  getRootId: (ctx: Ctx) => `pin-input-${ctx.uid}`,
  getInputId: (ctx: Ctx, id: string | number) => `pin-input-${ctx.uid}-${id}`,
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getElements: (ctx: Ctx) =>
    queryElements<HTMLInputElement>(dom.getDoc(ctx), `input[data-ownedby=${dom.getRootId(ctx)}]`),
  getFocusedEl: (ctx: Ctx) => dom.getElements(ctx)[ctx.focusedIndex],
}
