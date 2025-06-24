import { queryAll } from "@zag-js/dom-query"
import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `pin-input:${ctx.id}`
export const getInputId = (ctx: Scope, id: string) => ctx.ids?.input?.(id) ?? `pin-input:${ctx.id}:${id}`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `pin-input:${ctx.id}:hidden`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `pin-input:${ctx.id}:label`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `pin-input:${ctx.id}:control`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getInputEls = (ctx: Scope) => {
  const ownerId = CSS.escape(getRootId(ctx))
  const selector = `input[data-ownedby=${ownerId}]`
  return queryAll<HTMLInputElement>(getRootEl(ctx), selector)
}
export const getInputEl = (ctx: Scope, id: string) => ctx.getById<HTMLInputElement>(getInputId(ctx, id))
export const getInputElAtIndex = (ctx: Scope, index: number) => getInputEls(ctx)[index]
export const getFirstInputEl = (ctx: Scope) => getInputEls(ctx)[0]
export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))

export const setInputValue = (inputEl: HTMLInputElement, value: string) => {
  inputEl.value = value
  inputEl.setAttribute("value", value)
}
