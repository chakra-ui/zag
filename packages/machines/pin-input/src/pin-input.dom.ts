import { queryElements } from "@ui-machines/dom-utils"
import { MachineContext as Ctx } from "./pin-input.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => `pin-input-${ctx.uid}`,
  getInputId: (ctx: Ctx, id: string | number) => `pin-input-${ctx.uid}-${id}`,

  getRootEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getRootId(ctx)),
  getElements: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getRootId(ctx))
    const selector = `input[data-ownedby=${ownerId}]`
    return queryElements<HTMLInputElement>(dom.getRootEl(ctx), selector)
  },
  getFocusedEl: (ctx: Ctx) => dom.getElements(ctx)[ctx.focusedIndex],

  getFirstInputEl: (ctx: Ctx) => dom.getElements(ctx)[0],
}
