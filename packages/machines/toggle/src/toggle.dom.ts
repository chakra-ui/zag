import { defineDomHelpers } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./toggle.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `toggle:${ctx.id}`,
  getButtonId: (ctx: Ctx) => ctx.ids?.button ?? `toggle:${ctx.id}:button`,

  getButtonEl: (ctx: Ctx) => dom.getById(ctx, dom.getButtonId(ctx)),
})
