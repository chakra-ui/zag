import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `wheel-picker:${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `wheel-picker:${ctx.id}:label`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `wheel-picker:${ctx.id}:control`
export const getItemGroupId = (ctx: Scope) => ctx.ids?.itemGroup ?? `wheel-picker:${ctx.id}:item-group`
export const getItemId = (ctx: Scope, index: number) => ctx.ids?.item?.(index) ?? `wheel-picker:${ctx.id}:item:${index}`
export const getHighlightId = (ctx: Scope) => ctx.ids?.highlight ?? `wheel-picker:${ctx.id}:highlight`
export const getHighlightItemGroupId = (ctx: Scope) =>
  ctx.ids?.highlightItemGroup ?? `wheel-picker:${ctx.id}:highlight-item-group`
export const getHighlightItemId = (ctx: Scope, index: number) =>
  ctx.ids?.highlightItem?.(index) ?? `wheel-picker:${ctx.id}:highlight-item:${index}`
export const getHiddenSelectId = (ctx: Scope) => ctx.ids?.hiddenSelect ?? `wheel-picker:${ctx.id}:select`

export const getRootEl = (ctx: Scope) => ctx.getById<HTMLElement>(getRootId(ctx))
export const getControlEl = (ctx: Scope) => ctx.getById<HTMLElement>(getControlId(ctx))
export const getItemGroupEl = (ctx: Scope) => ctx.getById<HTMLElement>(getItemGroupId(ctx))
export const getHighlightItemGroupEl = (ctx: Scope) => ctx.getById<HTMLElement>(getHighlightItemGroupId(ctx))
export const getHiddenSelectEl = (ctx: Scope) => ctx.getById<HTMLSelectElement>(getHiddenSelectId(ctx))

export function getItemEls(ctx: Scope) {
  return getItemGroupEl(ctx)?.querySelectorAll<HTMLElement>("[data-part=item]") ?? []
}

export function focusSiblingControl(ctx: Scope, direction: 1 | -1) {
  const controlEl = getControlEl(ctx)
  const parentEl = getRootEl(ctx)?.parentElement
  if (!controlEl || !parentEl) return

  const controls = Array.from(
    parentEl.querySelectorAll<HTMLElement>('[data-scope="wheel-picker"][data-part="control"]:not([data-disabled])'),
  )

  if (controls.length < 2) return

  const index = controls.indexOf(controlEl)
  if (index === -1) return

  const nextIndex = (index + direction + controls.length) % controls.length
  controls[nextIndex]?.focus({ preventScroll: true })
}
