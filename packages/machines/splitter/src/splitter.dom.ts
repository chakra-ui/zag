import type { Scope } from "@zag-js/core"
import { isHTMLElement } from "@zag-js/dom-query"
import type { Style } from "@zag-js/types"
import { parts } from "./splitter.anatomy"
import type { CursorState, ResizeTriggerId } from "./splitter.types"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getResizeTriggerId = (ctx: Scope, id: string) => ctx.ids?.resizeTrigger?.(id) ?? `${ctx.id}:splitter:${id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getPanelId = (ctx: Scope, id: string | number) => ctx.ids?.panel?.(id) ?? `${ctx.id}:panel:${id}`
export const getGlobalCursorId = (ctx: Scope) => `${ctx.id}:global-cursor`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getPanelEls = (ctx: Scope) => ctx.queryAll(ctx.selector(parts.panel))
export const getResizeTriggerEl = (ctx: Scope, id: string | null | undefined) =>
  id != null ? ctx.query(`${ctx.selector(parts.resizeTrigger)}[data-id="${id}"]`) : null
export const getPanelEl = (ctx: Scope, id: string | number) =>
  ctx.query(`${ctx.selector(parts.panel)}[data-id="${id}"]`)

const getPanelIdFromEl = (el: Element | null) => {
  return isHTMLElement(el) && el.dataset.part === "panel" ? el.dataset.id : undefined
}

const getPrevPanelId = (el: HTMLElement | null) => {
  let prev = el?.previousElementSibling ?? null
  while (prev) {
    const id = getPanelIdFromEl(prev)
    if (id) return id
    prev = prev.previousElementSibling
  }
}

const getNextPanelId = (el: HTMLElement | null) => {
  let next = el?.nextElementSibling ?? null
  while (next) {
    const id = getPanelIdFromEl(next)
    if (id) return id
    next = next.nextElementSibling
  }
}

export const resolveResizeTriggerId = (ctx: Scope, id: ResizeTriggerId): `${string}:${string}` | null => {
  const [beforeId, afterId] = id.split(":")
  if (beforeId && afterId) return id as `${string}:${string}`

  const triggerEl = getResizeTriggerEl(ctx, id)
  const resolvedBeforeId = beforeId || getPrevPanelId(triggerEl)
  const resolvedAfterId = afterId || getNextPanelId(triggerEl)

  return resolvedBeforeId && resolvedAfterId ? `${resolvedBeforeId}:${resolvedAfterId}` : null
}

export const getCursor = (state: CursorState, x: boolean) => {
  let cursor: Style["cursor"] = x ? "col-resize" : "row-resize"
  if (state.isAtMin) cursor = x ? "e-resize" : "s-resize"
  if (state.isAtMax) cursor = x ? "w-resize" : "n-resize"
  return cursor
}

export const getResizeTriggerEls = (ctx: Scope) => {
  return ctx.queryAll(ctx.selector(parts.resizeTrigger))
}

export const getGlobalCursorEl = (ctx: Scope) => {
  return ctx.getDoc().getElementById(getGlobalCursorId(ctx))
}

export const setupGlobalCursor = (ctx: Scope, state: CursorState, x: boolean, nonce?: string) => {
  const styleEl = getGlobalCursorEl(ctx)
  const textContent = `* { cursor: ${getCursor(state, x)} !important; }`
  if (styleEl) {
    styleEl.textContent = textContent
  } else {
    const style = ctx.getDoc().createElement("style")
    if (nonce) style.nonce = nonce
    style.id = getGlobalCursorId(ctx)
    style.textContent = textContent
    ctx.getDoc().head.appendChild(style)
  }
}

export const removeGlobalCursor = (ctx: Scope) => {
  const styleEl = getGlobalCursorEl(ctx)
  styleEl?.remove()
}
