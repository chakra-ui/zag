import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `checkbox:${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `checkbox:${ctx.id}:label`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `checkbox:${ctx.id}:control`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `checkbox:${ctx.id}:input`
export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))
