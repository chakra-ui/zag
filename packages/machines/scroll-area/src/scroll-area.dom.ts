import type { Scope } from "@zag-js/core"
import { parts } from "./scroll-area.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getViewportId = (ctx: Scope) => ctx.ids?.viewport ?? `${ctx.id}:viewport`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getViewportEl = (ctx: Scope) => ctx.query(ctx.selector(parts.viewport))
export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))

export const getScrollbarXEl = (ctx: Scope) =>
  ctx.query(`${ctx.selector(parts.scrollbar)}[data-orientation=horizontal]`)
export const getScrollbarYEl = (ctx: Scope) => ctx.query(`${ctx.selector(parts.scrollbar)}[data-orientation=vertical]`)

export const getThumbXEl = (ctx: Scope) => ctx.query(`${ctx.selector(parts.thumb)}[data-orientation=horizontal]`)
export const getThumbYEl = (ctx: Scope) => ctx.query(`${ctx.selector(parts.thumb)}[data-orientation=vertical]`)

export const getCornerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.corner))
