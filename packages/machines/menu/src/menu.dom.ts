import type { Scope } from "@zag-js/core"
import { contains, getByTypeahead, getWindow, isHTMLElement, type TypeaheadState } from "@zag-js/dom-query"
import { isFunction } from "@zag-js/utils"
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
export const getContentId = (ctx: Scope, value?: string | null) => {
  const id = ctx.ids?.content ?? `${ctx.id}:content`
  return value != null ? `${id}:${value}` : id
}
export const getArrowId = (ctx: Scope) => ctx.ids?.arrow ?? `${ctx.id}:arrow`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `${ctx.id}:input`
export const getListId = (ctx: Scope) => ctx.ids?.list ?? `${ctx.id}:list`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `${ctx.id}:positioner`
export const getGroupId = (ctx: Scope, id: string) => ctx.ids?.group?.(id) ?? `${ctx.id}:group:${id}`

export const getItemId = (ctx: Scope, id: string) => `${ctx.id}:${id}`
export const getItemValue = (el: HTMLElement | null | undefined) => el?.dataset.value ?? null

export const getGroupLabelId = (ctx: Scope, id: string) => ctx.ids?.groupLabel?.(id) ?? `${ctx.id}:group-label:${id}`

// Element lookups — use querySelector with merged data attributes
export const getContentEl = (ctx: Scope, value?: string | null) => {
  const selector = ctx.selector(parts.content)
  if (value == null) return ctx.query(selector)
  return ctx.query(`${selector}[data-value="${value}"]`) ?? ctx.query(`${selector}:not([data-value])`)
}
export const getViewportEl = (ctx: Scope) => ctx.query(ctx.selector(parts.viewport))
export const getLayerEl = (ctx: Scope, value?: string | null) => getViewportEl(ctx) ?? getContentEl(ctx, value)
export const getPositionerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.positioner))
export const getTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.trigger))
export const getInputEl = (ctx: Scope) => ctx.query<HTMLInputElement>(ctx.selector(parts.input))

// The menu is told its menubar's root id via the `menubar` prop; coordination events
// are dispatched on that element. (No DOM sniffing — the relationship is declared.)
export const getMenubarEl = (ctx: Scope, rootId: string | undefined): HTMLElement | null =>
  rootId ? ctx.getById<HTMLElement>(rootId) : null

export const dispatchMenubarEvent = (menubarEl: HTMLElement, type: string, detail?: any) => {
  const win = getWindow(menubarEl)
  menubarEl.dispatchEvent(new win.CustomEvent(type, { detail }))
}
export const getItemEl = (ctx: Scope, value: string | null, triggerValue?: string | null) => {
  if (!value) return null
  const selector = `${ctx.selector(parts.item)}[data-value="${value}"]`
  return getContentEl(ctx, triggerValue)?.querySelector<HTMLElement>(selector) ?? ctx.query(selector)
}
export const getArrowEl = (ctx: Scope) => ctx.query(ctx.selector(parts.arrow))
export const getContextTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.contextTrigger))

export const getTriggerEls = (ctx: Scope): HTMLElement[] => ctx.queryAll<HTMLElement>(ctx.selector(parts.trigger))

export const getContextTriggerEls = (ctx: Scope): HTMLElement[] =>
  ctx.queryAll<HTMLElement>(ctx.selector(parts.contextTrigger))

export const getTriggerItemEl = (ctx: Scope) => ctx.query(ctx.selector(parts.triggerItem))

export const getActiveTriggerEl = (ctx: Scope, value: string | null): HTMLElement | null => {
  if (value == null) {
    return getTriggerEl(ctx) ?? getTriggerItemEl(ctx) ?? getTriggerEls(ctx)[0]
  }
  return (
    ctx.query(`${ctx.selector(parts.trigger)}[data-value="${value}"]`) ??
    ctx.query(`${ctx.selector(parts.triggerItem)}[data-value="${value}"]`)
  )
}

export const getElements = (ctx: Scope, triggerValue?: string | null) => {
  const ownerId = CSS.escape(ctx.id!)
  const selector = `[data-menu-item="${ownerId}"]:not([data-disabled])`
  const contentEl = getContentEl(ctx, triggerValue)
  return contentEl ? Array.from(contentEl.querySelectorAll<HTMLElement>(selector)) : []
}

const isMatch = (el: HTMLElement, value: string | null) => {
  if (!value) return false
  return el.id === value || el.dataset.value === value
}

export const getElemByKey = (
  ctx: Scope,
  opts: { key: string; value: string | null; typeaheadState: TypeaheadState; triggerValue?: string | null },
) => {
  const items = getElements(ctx, opts.triggerValue)
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

function getPortaledContentEl(service: MenuService): HTMLElement | null {
  const { scope, context } = service
  const triggerValue = context.get("triggerValue")
  return getLayerEl(scope, triggerValue) ?? scope.getDoc().getElementById(getContentId(scope, triggerValue))
}

export function isTargetWithinMenuTree(target: EventTarget | null, children: Record<string, MenuService>): boolean {
  if (!isHTMLElement(target)) return false
  for (const id in children) {
    const child = children[id]
    const childContent = getPortaledContentEl(child)
    if (childContent && contains(childContent, target)) return true
    const nested = child.refs.get("children")
    if (Object.keys(nested).length > 0 && isTargetWithinMenuTree(target, nested)) return true
  }
  return false
}

// Whether `target` is the trigger of an open submenu that holds focus, so the pointer crossing the
// trigger leaves that focus in place.
export function isFocusHeldBySubmenuOf(target: EventTarget | null, children: Record<string, MenuService>): boolean {
  if (!isHTMLElement(target)) return false
  for (const id in children) {
    const child = children[id]
    if (target.id !== getTriggerId(child.scope)) continue
    if (!child.state.hasTag("open")) return false
    return isTargetWithinMenuTree(child.scope.getActiveElement(), { [id]: child })
  }
  return false
}

export function dispatchClickWithModifiers(
  el: HTMLElement,
  event: Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "shiftKey" | "altKey">,
) {
  const win = getWindow(el)
  const { ctrlKey, metaKey, shiftKey, altKey } = event
  el.dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey, metaKey, shiftKey, altKey }))
}

export const getItemCloseOnSelect = (el: HTMLElement) => {
  const value = el.dataset.closeOnSelect
  return value == null ? undefined : value === "true"
}
