import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? ctx.id
export const getLegendId = (ctx: Scope) => ctx.ids?.legend ?? `${ctx.id}:legend`
export const getErrorTextId = (ctx: Scope) => ctx.ids?.errorText ?? `${ctx.id}:error-text`
export const getHelperTextId = (ctx: Scope) => ctx.ids?.helperText ?? `${ctx.id}:helper-text`

export const getRootEl = (ctx: Scope) => ctx.getById<HTMLFieldSetElement>(getRootId(ctx))
