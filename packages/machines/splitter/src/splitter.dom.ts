import type { Scope } from "@zag-js/core"
import { queryAll } from "@zag-js/dom-query"
import type { JSX, Style } from "@zag-js/types"
import type { PanelId, PanelSizeData, ResizeState } from "./splitter.types"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `splitter:${ctx.id}`
export const getResizeTriggerId = (ctx: Scope, id: string) =>
  ctx.ids?.resizeTrigger?.(id) ?? `splitter:${ctx.id}:splitter:${id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `splitter:${ctx.id}:label`
export const getPanelId = (ctx: Scope, id: string | number) => ctx.ids?.panel?.(id) ?? `splitter:${ctx.id}:panel:${id}`
export const getGlobalCursorId = (ctx: Scope) => `splitter:${ctx.id}:global-cursor`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getResizeTriggerEl = (ctx: Scope, id: string) => ctx.getById(getResizeTriggerId(ctx, id))
export const getPanelEl = (ctx: Scope, id: string | number) => ctx.getById(getPanelId(ctx, id))

export const getCursor = (state: ResizeState, x: boolean) => {
  let cursor: Style["cursor"] = x ? "col-resize" : "row-resize"
  if (state.isAtMin) cursor = x ? "e-resize" : "s-resize"
  if (state.isAtMax) cursor = x ? "w-resize" : "n-resize"
  return cursor
}

export const getPanelStyle = (panels: PanelSizeData[], id: PanelId): JSX.CSSProperties => {
  const flexGrow = panels.find((panel) => panel.id === id)?.size ?? "0"
  return { flexBasis: 0, flexGrow, flexShrink: 1, overflow: "hidden" }
}

export const getResizeTriggerEls = (ctx: Scope) => {
  const ownerId = CSS.escape(getRootId(ctx))
  return queryAll(getRootEl(ctx), `[role=separator][data-ownedby='${ownerId}']`)
}

export const setupGlobalCursor = (ctx: Scope, state: ResizeState, x: boolean) => {
  const styleEl = ctx.getById(getGlobalCursorId(ctx))
  const textContent = `* { cursor: ${getCursor(state, x)} !important; }`
  if (styleEl) {
    styleEl.textContent = textContent
  } else {
    const style = ctx.getDoc().createElement("style")
    style.id = getGlobalCursorId(ctx)
    style.textContent = textContent
    ctx.getDoc().head.appendChild(style)
  }
}

export const removeGlobalCursor = (ctx: Scope) => {
  const styleEl = ctx.getById(getGlobalCursorId(ctx))
  styleEl?.remove()
}
