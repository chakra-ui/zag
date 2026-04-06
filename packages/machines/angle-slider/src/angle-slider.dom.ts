import type { Scope } from "@zag-js/core"
import { parts } from "./angle-slider.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getThumbId = (ctx: Scope) => ctx.ids?.thumb ?? `${ctx.id}:thumb`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `${ctx.id}:input`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getValueTextId = (ctx: Scope) => ctx.ids?.valueText ?? `${ctx.id}:value-text`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`

export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))
export const getControlEl = (ctx: Scope) => ctx.query<HTMLElement>(ctx.selector(parts.control))
export const getThumbEl = (ctx: Scope) => ctx.query<HTMLElement>(ctx.selector(parts.thumb))
