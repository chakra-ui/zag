import { createScope, nextById, prevById, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./toggle-group.types"
import { first, last } from "@zag-js/utils"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `toggle-group:${ctx.id}`,
  getItemId: (ctx: Ctx, value: string) => ctx.ids?.item?.(value) ?? `toggle-group:${ctx.id}:${value}`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getElements: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getRootId(ctx))
    const selector = `[data-ownedby='${ownerId}']:not([data-disabled])`
    return queryAll(dom.getRootEl(ctx), selector)
  },
  getFirstEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), id, ctx.currentLoopFocus),
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), id, ctx.currentLoopFocus),
})
