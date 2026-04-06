import type { Scope } from "@zag-js/core"
import { dispatchInputValueEvent, query } from "@zag-js/dom-query"
import { parts } from "./rating-group.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `${ctx.id}:input`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getItemId = (ctx: Scope, id: string) => ctx.ids?.item?.(id) ?? `${ctx.id}:item:${id}`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getControlEl = (ctx: Scope) => ctx.query(ctx.selector(parts.control))
export const getRadioEl = (ctx: Scope, value: number) => {
  const selector = `[role=radio][aria-posinset='${Math.ceil(value)}']`
  return query(getControlEl(ctx), selector)
}

export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))

export const dispatchChangeEvent = (ctx: Scope, value: number) => {
  const inputEl = getHiddenInputEl(ctx)
  if (!inputEl) return
  dispatchInputValueEvent(inputEl, { value })
}
