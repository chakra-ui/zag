import { nextById, prevById, queryAll } from "@ui-machines/dom-utils"
import { first, last } from "@ui-machines/utils"
import type { MachineContext as Ctx } from "./accordion.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => `accordion-${ctx.uid}`,
  getGroupId: (ctx: Ctx, id: string) => `accordion-${ctx.uid}-item-${id}`,
  getPanelId: (ctx: Ctx, id: string) => `accordion-${ctx.uid}-panel-${id}`,
  getTriggerId: (ctx: Ctx, id: string) => `accordion-${ctx.uid}-trigger-${id}`,

  getRootEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getRootId(ctx)),
  getTriggers: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getRootId(ctx))
    const selector = `[aria-controls][data-ownedby='${ownerId}']:not([disabled])`
    return queryAll(dom.getRootEl(ctx), selector)
  },

  getFirstTriggerEl: (ctx: Ctx) => first(dom.getTriggers(ctx)),
  getLastTriggerEl: (ctx: Ctx) => last(dom.getTriggers(ctx)),
  getNextTriggerEl: (ctx: Ctx, id: string) => nextById(dom.getTriggers(ctx), dom.getTriggerId(ctx, id)),
  getPrevTriggerEl: (ctx: Ctx, id: string) => prevById(dom.getTriggers(ctx), dom.getTriggerId(ctx, id)),
}
