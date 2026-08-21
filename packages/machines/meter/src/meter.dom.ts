import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `meter:${ctx.id}`
export const getTrackId = (ctx: Scope) => ctx.ids?.track ?? `meter:${ctx.id}:track`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `meter:${ctx.id}:label`
