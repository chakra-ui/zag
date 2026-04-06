import type { Scope } from "@zag-js/core"
import { parts } from "./switch.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getThumbId = (ctx: Scope) => ctx.ids?.thumb ?? `${ctx.id}:thumb`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `${ctx.id}:input`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))
