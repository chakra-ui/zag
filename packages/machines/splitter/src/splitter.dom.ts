import type { Scope } from "@zag-js/core"
import type { Style } from "@zag-js/types"
import type { CursorState } from "./splitter.types"
import { parts } from "./splitter.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getResizeTriggerId = (ctx: Scope, id: string) => ctx.ids?.resizeTrigger?.(id) ?? `${ctx.id}:splitter:${id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getPanelId = (ctx: Scope, id: string | number) => ctx.ids?.panel?.(id) ?? `${ctx.id}:panel:${id}`
export const getGlobalCursorId = (ctx: Scope) => `${ctx.id}:global-cursor`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getPanelEls = (ctx: Scope) => ctx.queryAll(ctx.selector(parts.panel))
export const getResizeTriggerEl = (ctx: Scope, id: string) =>
  ctx.query(`${ctx.selector(parts.resizeTrigger)}[data-id="${id}"]`)
export const getPanelEl = (ctx: Scope, id: string | number) =>
  ctx.query(`${ctx.selector(parts.panel)}[data-id="${id}"]`)

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
