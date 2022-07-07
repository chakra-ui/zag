import { getRoots } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./toggle.types"

export const dom = {
  ...getRoots(),

  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `toggle:${ctx.id}`,
  getButtonId: (ctx: Ctx) => ctx.ids?.button ?? `toggle:${ctx.id}:button`,

  getButtonEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getButtonId(ctx)),
}
