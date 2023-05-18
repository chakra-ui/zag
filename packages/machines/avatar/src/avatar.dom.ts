import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./avatar.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `avatar:${ctx.id}`,
  getImageId: (ctx: Ctx) => `avatar:${ctx.id}:image`,
  getFallbackId: (ctx: Ctx) => `avatar:${ctx.id}:fallback`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getImageEl: (ctx: Ctx) => dom.getById<HTMLImageElement>(ctx, dom.getImageId(ctx)),
})
