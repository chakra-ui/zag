import type { MachineContext as Ctx } from "./toggle.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `toggle:${ctx.uid}`,
  getButtonId: (ctx: Ctx) => ctx.ids?.button ?? `toggle:${ctx.uid}:button`,
  getButtonEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getButtonId(ctx)),
}
