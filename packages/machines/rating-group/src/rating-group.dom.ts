import type { Scope } from "@zag-js/core"
import { dispatchInputValueEvent, query } from "@zag-js/dom-query"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `rating:${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `rating:${ctx.id}:label`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `rating:${ctx.id}:input`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `rating:${ctx.id}:control`
export const getItemId = (ctx: Scope, id: string) => ctx.ids?.item?.(id) ?? `rating:${ctx.id}:item:${id}`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getControlEl = (ctx: Scope) => ctx.getById(getControlId(ctx))
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
