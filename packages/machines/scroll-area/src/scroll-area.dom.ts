import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./scroll-area.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.id,
  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
})
