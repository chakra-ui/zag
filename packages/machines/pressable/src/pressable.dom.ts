import { defineHelpers } from "@zag-js/dom-query"
import type { EventMap, MachineContext as Ctx } from "./pressable.types"

export const dom = defineHelpers({
  getPressableId: (ctx: Ctx) => `pressable:${ctx.id}`,
  getPressableEl: (ctx: Ctx) => {
    const pressableEl = dom.getById(ctx, dom.getPressableId(ctx))
    if (!pressableEl) throw new Error("Pressable element does not exist")
    return pressableEl
  },

  emitter: (ctx: Ctx) => dom.createEmitter<EventMap>(ctx, () => dom.getPressableEl(ctx)),
  listener: (ctx: Ctx) => dom.createListener<EventMap>(() => dom.getPressableEl(ctx)),
})
