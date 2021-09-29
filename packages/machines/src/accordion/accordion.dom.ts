import { queryElements, nextById, prevById } from "tiny-nodelist"
import { first, last } from "tiny-array"
import type { AccordionMachineContext as Ctx } from "./accordion.machine"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => `accordion-${ctx.uid}`,
  getGroupId: (ctx: Ctx, id: string) => `accordion-${ctx.uid}-item-${id}`,
  getPanelId: (ctx: Ctx, id: string) => `accordion-${ctx.uid}-panel-${id}`,
  getTriggerId: (ctx: Ctx, id: string) => `accordion-${ctx.uid}-trigger-${id}`,

  getRootEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getRootId(ctx)),
  getElements: (ctx: Ctx) => {
    const selector = `[aria-controls][data-ownedby='${dom.getRootId(ctx)}']:not([disabled])`
    return queryElements(dom.getRootEl(ctx), selector)
  },

  getFirstEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), dom.getTriggerId(ctx, id)),
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), dom.getTriggerId(ctx, id)),
}
