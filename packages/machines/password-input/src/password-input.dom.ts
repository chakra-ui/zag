import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `p-input-${ctx.id}`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `p-input-${ctx.id}-input`

export const getInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getInputId(ctx))
