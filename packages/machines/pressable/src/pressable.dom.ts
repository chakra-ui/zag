import { defineDomHelpers } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./pressable.types"

export const dom = defineDomHelpers({
  getPressableId: (ctx: Ctx) => `pressable:${ctx.id}`,
  getPressableEl: (ctx: Ctx) => dom.getById(ctx, dom.getPressableId(ctx)),
})
