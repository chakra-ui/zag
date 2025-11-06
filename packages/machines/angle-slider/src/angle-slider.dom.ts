import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `angle-slider:${ctx.id}`
export const getThumbId = (ctx: Scope) => ctx.ids?.thumb ?? `angle-slider:${ctx.id}:thumb`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `angle-slider:${ctx.id}:input`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `angle-slider:${ctx.id}:control`
export const getValueTextId = (ctx: Scope) => ctx.ids?.valueText ?? `angle-slider:${ctx.id}:value-text`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `angle-slider:${ctx.id}:label`

export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))
export const getControlEl = (ctx: Scope) => ctx.getById<HTMLElement>(getControlId(ctx))
export const getThumbEl = (ctx: Scope) => ctx.getById<HTMLElement>(getThumbId(ctx))
