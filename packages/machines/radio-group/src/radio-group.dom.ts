import type { Scope } from "@zag-js/core"
import { parts } from "./radio-group.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getItemId = (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `${ctx.id}:radio:${value}`
export const getItemHiddenInputId = (ctx: Scope, value: string) =>
  ctx.ids?.itemHiddenInput?.(value) ?? `${ctx.id}:radio-input:${value}`
export const getItemControlId = (ctx: Scope, value: string) =>
  ctx.ids?.itemControl?.(value) ?? `${ctx.id}:radio-control:${value}`
export const getItemLabelId = (ctx: Scope, value: string) =>
  ctx.ids?.itemLabel?.(value) ?? `${ctx.id}:radio-label:${value}`
export const getIndicatorId = (ctx: Scope) => ctx.ids?.indicator ?? `${ctx.id}:indicator`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getItemHiddenInputEl = (ctx: Scope, value: string) =>
  ctx.getById<HTMLInputElement>(getItemHiddenInputId(ctx, value))
export const getIndicatorEl = (ctx: Scope) => ctx.query(ctx.selector(parts.indicator))

export const getFirstEnabledInputEl = (ctx: Scope) =>
  getRootEl(ctx)?.querySelector<HTMLInputElement>("input:not(:disabled)")
export const getFirstEnabledAndCheckedInputEl = (ctx: Scope) =>
  getRootEl(ctx)?.querySelector<HTMLInputElement>("input:not(:disabled):checked")

export const getInputEls = (ctx: Scope) => {
  return ctx.queryAll<HTMLInputElement>(`${ctx.selector(parts.item)} input[type=radio]:not([disabled])`)
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
