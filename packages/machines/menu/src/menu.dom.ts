import type { Scope } from "@zag-js/core"
import { contains, getByTypeahead, getWindow, isHTMLElement, type TypeaheadState } from "@zag-js/dom-query"
import { first, isFunction, last, next, prev } from "@zag-js/utils"
import { parts } from "./menu.anatomy"
import type { MenuService } from "./menu.types"

// ID generators — only for parts referenced by ARIA attributes
export const getTriggerId = (ctx: Scope, value?: string) => {
  const customId = ctx.ids?.trigger
  if (customId != null) return isFunction(customId) ? customId(value) : customId
  return value ? `${ctx.id}:trigger:${value}` : `${ctx.id}:trigger`
}

export const getContextTriggerId = (ctx: Scope, value?: string) => {
  const customId = ctx.ids?.contextTrigger
  if (customId != null) return isFunction(customId) ? customId(value) : customId
  return value ? `${ctx.id}:ctx-trigger:${value}` : `${ctx.id}:ctx-trigger`
}
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`
export const getArrowId = (ctx: Scope) => ctx.ids?.arrow ?? `${ctx.id}:arrow`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `${ctx.id}:positioner`
export const getGroupId = (ctx: Scope, id: string) => ctx.ids?.group?.(id) ?? `${ctx.id}:group:${id}`

export const getItemId = (ctx: Scope, id: string) => `${ctx.id}:${id}`
export const getItemValue = (el: HTMLElement | null | undefined) => el?.dataset.value ?? null

export const getGroupLabelId = (ctx: Scope, id: string) => ctx.ids?.groupLabel?.(id) ?? `${ctx.id}:group-label:${id}`

// Element lookups — use querySelector with merged data attributes
export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getPositionerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.positioner))
export const getTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.trigger))
export const getItemEl = (ctx: Scope, value: string | null) =>
  value ? ctx.query(`${ctx.selector(parts.item)}[data-value="${value}"]`) : null
export const getArrowEl = (ctx: Scope) => ctx.query(ctx.selector(parts.arrow))
export const getContextTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.contextTrigger))

export const getTriggerEls = (ctx: Scope): HTMLElement[] => ctx.queryAll<HTMLElement>(ctx.selector(parts.trigger))

export const getContextTriggerEls = (ctx: Scope): HTMLElement[] =>
  ctx.queryAll<HTMLElement>(ctx.selector(parts.contextTrigger))

export const getActiveTriggerEl = (ctx: Scope, value: string | null): HTMLElement | null => {
  // When value is null, use ID-based lookup (works for submenus with trigger-item)
  // Fall back to query-based lookup for multi-trigger cases with no active value
  if (value == null) {
    return getTriggerEl(ctx) ?? getTriggerEls(ctx)[0]
  }
  return ctx.query(`${ctx.selector(parts.trigger)}[data-value="${value}"]`)
}

export const getElements = (ctx: Scope) => {
  const ownerId = CSS.escape(ctx.id!)
  const selector = `[data-menu-item="${ownerId}"]:not([data-disabled])`
  const contentEl = getContentEl(ctx)
  return contentEl ? Array.from(contentEl.querySelectorAll<HTMLElement>(selector)) : []
}

export const getFirstEl = (ctx: Scope) => first(getElements(ctx))
export const getLastEl = (ctx: Scope) => last(getElements(ctx))

const isMatch = (el: HTMLElement, value: string | null) => {
  if (!value) return false
  return el.id === value || el.dataset.value === value
}

export const getNextEl = (
  ctx: Scope,
  opts: { loop?: boolean | undefined; value: string | null; loopFocus: boolean },
) => {
  const items = getElements(ctx)
  const index = items.findIndex((el) => isMatch(el, opts.value))
  return next(items, index, { loop: opts.loop ?? opts.loopFocus })
}

export const getPrevEl = (
  ctx: Scope,
  opts: { loop?: boolean | undefined; value: string | null; loopFocus: boolean },
) => {
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
  return !!el?.getAttribute("role")?.startsWith("menuitem") && !!el?.hasAttribute("data-controls")
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

export const itemSelectEvent = "menu:select"

export function dispatchSelectionEvent(el: HTMLElement | null, value: string) {
  if (!el) return
  const win = getWindow(el)
  const event = new win.CustomEvent(itemSelectEvent, { detail: { value } })
  el.dispatchEvent(event)
}

function getPortaledContentEl(scope: MenuService["scope"]): HTMLElement | null {
  const contentId = getContentId(scope)
  return getContentEl(scope) ?? scope.getDoc().getElementById(contentId)
}

export function isTargetWithinMenuTree(target: EventTarget | null, children: Record<string, MenuService>): boolean {
  if (!isHTMLElement(target)) return false
  for (const id in children) {
    const child = children[id]
    const childContent = getPortaledContentEl(child.scope)
    if (childContent && contains(childContent, target)) return true
    const nested = child.refs.get("children")
    if (Object.keys(nested).length > 0 && isTargetWithinMenuTree(target, nested)) return true
  }
  return false
}
