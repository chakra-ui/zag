import type { MachineContext as Ctx } from "./toggle.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootNode: (ctx: Ctx) => ctx.rootNode ?? dom.getDoc(ctx),

  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `toggle:${ctx.uid}`,
  getButtonId: (ctx: Ctx) => ctx.ids?.button ?? `toggle:${ctx.uid}:button`,

  getButtonEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getButtonId(ctx)),
}
