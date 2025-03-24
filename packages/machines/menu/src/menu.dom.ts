import type { Scope } from "@zag-js/core"
import { getByTypeahead, getWindow, isHTMLElement, queryAll, type TypeaheadState } from "@zag-js/dom-query"
import { first, last, next, prev } from "@zag-js/utils"

export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `menu:${ctx.id}:trigger`
export const getContextTriggerId = (ctx: Scope) => ctx.ids?.contextTrigger ?? `menu:${ctx.id}:ctx-trigger`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `menu:${ctx.id}:content`
export const getArrowId = (ctx: Scope) => ctx.ids?.arrow ?? `menu:${ctx.id}:arrow`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `menu:${ctx.id}:popper`
export const getGroupId = (ctx: Scope, id: string) => ctx.ids?.group?.(id) ?? `menu:${ctx.id}:group:${id}`

export const getItemId = (ctx: Scope, id: string) => `${ctx.id}/${id}`
export const getItemValue = (el: HTMLElement | null | undefined) => el?.dataset.value ?? null

export const getGroupLabelId = (ctx: Scope, id: string) =>
  ctx.ids?.groupLabel?.(id) ?? `menu:${ctx.id}:group-label:${id}`

export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getPositionerEl = (ctx: Scope) => ctx.getById(getPositionerId(ctx))
export const getTriggerEl = (ctx: Scope) => ctx.getById(getTriggerId(ctx))
export const getItemEl = (ctx: Scope, value: string | null) => (value ? ctx.getById(getItemId(ctx, value)) : null)
export const getArrowEl = (ctx: Scope) => ctx.getById(getArrowId(ctx))
export const getContextTriggerEl = (ctx: Scope) => ctx.getById(getContextTriggerId(ctx))

export const getElements = (ctx: Scope) => {
  const ownerId = CSS.escape(getContentId(ctx))
  const selector = `[role^="menuitem"][data-ownedby=${ownerId}]:not([data-disabled])`
  return queryAll(getContentEl(ctx), selector)
}

export const getFirstEl = (ctx: Scope) => first(getElements(ctx))
export const getLastEl = (ctx: Scope) => last(getElements(ctx))

const isMatch = (el: HTMLElement, value: string | null) => {
  if (!value) return false
  return el.id === value || el.dataset.value === value
}

export const getNextEl = (ctx: Scope, opts: { loop?: boolean; value: string | null; loopFocus: boolean }) => {
  const items = getElements(ctx)
  const index = items.findIndex((el) => isMatch(el, opts.value))
  return next(items, index, { loop: opts.loop ?? opts.loopFocus })
}

export const getPrevEl = (ctx: Scope, opts: { loop?: boolean; value: string | null; loopFocus: boolean }) => {
  const items = getElements(ctx)
  const index = items.findIndex((el) => isMatch(el, opts.value))
  return prev(items, index, { loop: opts.loop ?? opts.loopFocus })
}

export const getElemByKey = (
  ctx: Scope,
  opts: { key: string; value: string | null; typeaheadState: TypeaheadState },
) => {
  const items = getElements(ctx)
  const item = items.find((el) => isMatch(el, opts.value))
  return getByTypeahead(items, { state: opts.typeaheadState, key: opts.key, activeId: item?.id ?? null })
}

export const isTargetDisabled = (v: EventTarget | null) => {
  return isHTMLElement(v) && (v.dataset.disabled === "" || v.hasAttribute("disabled"))
}

export const isTriggerItem = (el: HTMLElement | null) => {
  return !!el?.getAttribute("role")?.startsWith("menuitem") && !!el?.hasAttribute("aria-controls")
}

export const getOptionFromItemEl = (el: HTMLElement) => {
  return {
    id: el.id,
    name: el.dataset.name,
    value: el.dataset.value,
    valueText: el.dataset.valueText,
    type: el.dataset.type,
  }
}

export function dispatchSelectionEvent(el: HTMLElement | null, value: string) {
  if (!el) return
  const win = getWindow(el)
  const event = new win.CustomEvent("menu:select", { detail: { value } })
  el.dispatchEvent(event)
}
