import type { Scope } from "@zag-js/core"
import { parts } from "./marquee.anatomy"

export const dom = {
  // ID generators — only for parts referenced by ARIA attributes
  getRootId: (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`,
  getViewportId: (ctx: Scope) => ctx.ids?.viewport ?? `${ctx.id}:viewport`,
  getContentId: (ctx: Scope, index: number) => ctx.ids?.content?.(index) ?? `${ctx.id}:content:${index}`,

  // Element lookups — use querySelector with merged data attributes
  getRootEl: (ctx: Scope) => ctx.query(ctx.selector(parts.root)),
  getViewportEl: (ctx: Scope) => ctx.query(ctx.selector(parts.viewport)),
  getContentEl: (ctx: Scope, index: number) => ctx.query(`${ctx.selector(parts.content)}[data-index="${index}"]`),
}
