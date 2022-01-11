import type { ToggleMachineContext as Ctx } from "./toggle.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootId: (ctx: Ctx) => `toggle-${ctx.uid}`,
  getButtonId: (ctx: Ctx) => `toggle-${ctx.uid}--button`,
  getButtonEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getButtonId(ctx)),
}
