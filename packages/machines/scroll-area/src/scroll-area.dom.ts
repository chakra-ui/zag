import type { Scope } from "@zag-js/core"
import { query } from "@zag-js/dom-query"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `scroll-area-${ctx.id}`
export const getViewportId = (ctx: Scope) => ctx.ids?.viewport ?? `scroll-area-${ctx.id}:viewport`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `scroll-area-${ctx.id}:content`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getViewportEl = (ctx: Scope) => ctx.getById(getViewportId(ctx))
export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))

export const getScrollbarXEl = (ctx: Scope) =>
  query(getRootEl(ctx), `[data-part=scrollbar][data-orientation=horizontal][data-ownedby="${getRootId(ctx)}"]`)
export const getScrollbarYEl = (ctx: Scope) =>
  query(getRootEl(ctx), `[data-part=scrollbar][data-orientation=vertical][data-ownedby="${getRootId(ctx)}"]`)

export const getThumbXEl = (ctx: Scope) =>
  query(getScrollbarXEl(ctx), `[data-part=thumb][data-orientation=horizontal][data-ownedby="${getRootId(ctx)}"]`)
export const getThumbYEl = (ctx: Scope) =>
  query(getScrollbarYEl(ctx), `[data-part=thumb][data-orientation=vertical][data-ownedby="${getRootId(ctx)}"]`)

export const getCornerEl = (ctx: Scope) => query(getRootEl(ctx), `[data-part=corner][data-ownedby="${getRootId(ctx)}"]`)
