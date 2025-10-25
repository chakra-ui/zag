import type { Scope } from "@zag-js/core"

export const dom = {
  getRootId: (ctx: Scope) => ctx.ids?.root ?? `marquee:${ctx.id}`,
  getViewportId: (ctx: Scope) => ctx.ids?.viewport ?? `marquee:${ctx.id}:viewport`,
  getContentId: (ctx: Scope, index: number) => ctx.ids?.content?.(index) ?? `marquee:${ctx.id}:content:${index}`,

  getRootEl: (ctx: Scope) => ctx.getById(dom.getRootId(ctx)),
  getViewportEl: (ctx: Scope) => ctx.getById(dom.getViewportId(ctx)),
  getContentEl: (ctx: Scope, index: number) => ctx.getById(dom.getContentId(ctx, index)),
}
