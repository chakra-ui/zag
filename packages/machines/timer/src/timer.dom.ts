import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `timer:${ctx.id}:root`
export const getAreaId = (ctx: Scope) => ctx.ids?.area ?? `timer:${ctx.id}:area`
export const getAreaEl = (ctx: Scope) => ctx.getById(getAreaId(ctx))
