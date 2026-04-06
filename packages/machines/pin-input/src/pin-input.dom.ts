import type { Scope } from "@zag-js/core"
import { parts } from "./pin-input.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getInputId = (ctx: Scope, id: string) => ctx.ids?.input?.(id) ?? `${ctx.id}:${id}`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `${ctx.id}:hidden`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getInputEls = (ctx: Scope) => {
  return ctx.queryAll<HTMLInputElement>(ctx.selector(parts.input))
}
export const getInputElAtIndex = (ctx: Scope, index: number) => getInputEls(ctx)[index]
export const getFirstInputEl = (ctx: Scope) => getInputEls(ctx)[0]
export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))

export const setInputValue = (inputEl: HTMLInputElement, value: string) => {
  inputEl.value = value
  inputEl.setAttribute("value", value)
}
