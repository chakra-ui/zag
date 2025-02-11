import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `avatar:${ctx.id}`
export const getImageId = (ctx: Scope) => ctx.ids?.image ?? `avatar:${ctx.id}:image`
export const getFallbackId = (ctx: Scope) => ctx.ids?.fallback ?? `avatar:${ctx.id}:fallback`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getImageEl = (ctx: Scope) => ctx.getById<HTMLImageElement>(getImageId(ctx))
