import type { Scope } from "@zag-js/core"
import { parts } from "./checkbox.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `${ctx.id}:input`
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))
