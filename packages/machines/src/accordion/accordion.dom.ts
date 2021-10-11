import { queryElements, nextById, prevById } from "tiny-nodelist"
import { first, last } from "tiny-array"
import type { AccordionMachineContext as Ctx } from "./accordion.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => `accordion-${ctx.uid}`,
  getGroupId: (ctx: Ctx, id: string) => `accordion-${ctx.uid}-item-${id}`,
  getPanelId: (ctx: Ctx, id: string) => `accordion-${ctx.uid}-panel-${id}`,
  getTriggerId: (ctx: Ctx, id: string) => `accordion-${ctx.uid}-trigger-${id}`,

  getRootEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getRootId(ctx)),
  getTriggers: (ctx: Ctx) => {
    const selector = `[aria-controls][data-ownedby='${dom.getRootId(ctx)}']:not([disabled])`
    return queryElements(dom.getRootEl(ctx), selector)
  },

  getFirstTriggerEl: (ctx: Ctx) => first(dom.getTriggers(ctx)),
  getLastTriggerEl: (ctx: Ctx) => last(dom.getTriggers(ctx)),
  getNextTriggerEl: (ctx: Ctx, id: string) => nextById(dom.getTriggers(ctx), dom.getTriggerId(ctx, id)),
  getPrevTriggerEl: (ctx: Ctx, id: string) => prevById(dom.getTriggers(ctx), dom.getTriggerId(ctx, id)),
}
