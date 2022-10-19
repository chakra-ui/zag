import { defineHelpers } from "@zag-js/dom-query"
import type { EventMap, MachineContext as Ctx } from "./pagination.types"

export const dom = defineHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `pagination:${ctx.id}`,
  getPrevItemId: (ctx: Ctx) => ctx.ids?.prevItem ?? `pagination:${ctx.id}:prev-item`,
  getNextItemId: (ctx: Ctx) => ctx.ids?.nextItem ?? `pagination:${ctx.id}:next-item`,

  getEllipsisId: (ctx: Ctx, index: number) => ctx.ids?.ellipsis?.(index) ?? `pagination:${ctx.id}:ellipsis:${index}`,
  getItemId: (ctx: Ctx, page: number) => ctx.ids?.item?.(page) ?? `pagination:${ctx.id}:item:${page}`,

  getRootEl: (ctx: Ctx) => {
    const rootEl = dom.getById(ctx, dom.getRootId(ctx))
    if (!rootEl) throw new Error("Root element does not exist")
    return rootEl
  },

  emitter: (ctx: Ctx) => dom.createEmitter<EventMap>(ctx, () => dom.getRootEl(ctx)),
  listener: (ctx: Ctx) => dom.createListener<EventMap>(() => dom.getRootEl(ctx)),
})
