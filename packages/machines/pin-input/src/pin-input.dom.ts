import { queryElements } from "tiny-nodelist"
import { nextIndex, prevIndex } from "tiny-array"
import { PinInputMachineContext as Ctx } from "./pin-input.machine"

export const dom = {
  getRootId: (ctx: Ctx) => `pin-input-${ctx.uid}`,
  getInputId: (ctx: Ctx, id: string | number) => `pin-input-${ctx.uid}-${id}`,
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getElements: (ctx: Ctx) =>
    queryElements<HTMLInputElement>(dom.getDoc(ctx), `input[data-ownedby=${dom.getRootId(ctx)}]`),
  getFirstEl: (ctx: Ctx) => dom.getElements(ctx)[0],
  getNextIndex: (ctx: Ctx) => nextIndex(dom.getElements(ctx), ctx.focusedIndex, { loop: false }),
  getPrevIndex: (ctx: Ctx) => prevIndex(dom.getElements(ctx), ctx.focusedIndex, { loop: false }),
  getFocusedEl: (ctx: Ctx) => dom.getElements(ctx)[ctx.focusedIndex],
}
