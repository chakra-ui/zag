import type { Scope } from "@zag-js/core"
import { queryAll } from "@zag-js/dom-query"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `radio-group:${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `radio-group:${ctx.id}:label`
export const getItemId = (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `radio-group:${ctx.id}:radio:${value}`
export const getItemHiddenInputId = (ctx: Scope, value: string) =>
  ctx.ids?.itemHiddenInput?.(value) ?? `radio-group:${ctx.id}:radio:input:${value}`
export const getItemControlId = (ctx: Scope, value: string) =>
  ctx.ids?.itemControl?.(value) ?? `radio-group:${ctx.id}:radio:control:${value}`
export const getItemLabelId = (ctx: Scope, value: string) =>
  ctx.ids?.itemLabel?.(value) ?? `radio-group:${ctx.id}:radio:label:${value}`
export const getIndicatorId = (ctx: Scope) => ctx.ids?.indicator ?? `radio-group:${ctx.id}:indicator`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getItemHiddenInputEl = (ctx: Scope, value: string) =>
  ctx.getById<HTMLInputElement>(getItemHiddenInputId(ctx, value))
export const getIndicatorEl = (ctx: Scope) => ctx.getById(getIndicatorId(ctx))

export const getFirstEnabledInputEl = (ctx: Scope) =>
  getRootEl(ctx)?.querySelector<HTMLInputElement>("input:not(:disabled)")
export const getFirstEnabledAndCheckedInputEl = (ctx: Scope) =>
  getRootEl(ctx)?.querySelector<HTMLInputElement>("input:not(:disabled):checked")

export const getInputEls = (ctx: Scope) => {
  const ownerId = CSS.escape(getRootId(ctx))
  const selector = `input[type=radio][data-ownedby='${ownerId}']:not([disabled])`
  return queryAll<HTMLInputElement>(getRootEl(ctx), selector)
}

export const getRadioEl = (ctx: Scope, value: string | null) => {
  if (!value) return
  return ctx.getById(getItemId(ctx, value))
}

export const getOffsetRect = (el: HTMLElement | undefined) => ({
  x: el?.offsetLeft ?? 0,
  y: el?.offsetTop ?? 0,
  width: el?.offsetWidth ?? 0,
  height: el?.offsetHeight ?? 0,
})

export const getRectById = (ctx: Scope, id: string) => {
  const radioEl = ctx.getById(getItemId(ctx, id))
  if (!radioEl) return
  return getOffsetRect(radioEl)
}
