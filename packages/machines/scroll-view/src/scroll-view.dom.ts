import type { Scope } from "@zag-js/core"
import { query } from "@zag-js/dom-query/src/query"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `scroll-view-${ctx.id}`
export const getViewportId = (ctx: Scope) => ctx.ids?.viewport ?? `scroll-view-${ctx.id}:viewport`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `scroll-view-${ctx.id}:content`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getViewportEl = (ctx: Scope) => ctx.getById(getViewportId(ctx))
export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))

export const getScrollbarXEl = (ctx: Scope) =>
  query(getRootEl(ctx), `[data-part=scrollbar][data-orientation=horizontal]`)
export const getScrollbarYEl = (ctx: Scope) => query(getRootEl(ctx), `[data-part=scrollbar][data-orientation=vertical]`)

export const getThumbXEl = (ctx: Scope) => query(getRootEl(ctx), `[data-part=thumb][data-orientation=horizontal]`)
export const getThumbYEl = (ctx: Scope) => query(getRootEl(ctx), `[data-part=thumb][data-orientation=vertical]`)

export const getCornerEl = (ctx: Scope) => query(getRootEl(ctx), `[data-part=corner]`)
