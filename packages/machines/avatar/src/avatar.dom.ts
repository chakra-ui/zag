import type { Scope } from "@zag-js/core"
import { parts } from "./avatar.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getImageId = (ctx: Scope) => ctx.ids?.image ?? `${ctx.id}:image`
export const getFallbackId = (ctx: Scope) => ctx.ids?.fallback ?? `${ctx.id}:fallback`

export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getImageEl = (ctx: Scope) => ctx.query<HTMLImageElement>(ctx.selector(parts.image))
