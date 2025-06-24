import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `switch:${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `switch:${ctx.id}:label`
export const getThumbId = (ctx: Scope) => ctx.ids?.thumb ?? `switch:${ctx.id}:thumb`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `switch:${ctx.id}:control`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `switch:${ctx.id}:input`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))
