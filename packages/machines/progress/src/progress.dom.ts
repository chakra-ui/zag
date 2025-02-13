import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `progress-${ctx.id}`
export const getTrackId = (ctx: Scope) => ctx.ids?.track ?? `progress-${ctx.id}-track`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `progress-${ctx.id}-label`
export const getCircleId = (ctx: Scope) => ctx.ids?.circle ?? `progress-${ctx.id}-circle`
