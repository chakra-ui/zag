import type { Scope } from "@zag-js/core"
import { getElementRect } from "@zag-js/rect-utils"
import { parts } from "./dnd.anatomy"
import type { DropEntry, DropPlacement } from "./dnd.types"

/* -----------------------------------------------------------------------------
 * ID generators
 * -----------------------------------------------------------------------------*/

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `dnd:${ctx.id}`

export const getDraggableId = (ctx: Scope, value: string) =>
  ctx.ids?.draggable?.(value) ?? `dnd:${ctx.id}:draggable:${value}`

export const getDropTargetId = (ctx: Scope, value: string) =>
  ctx.ids?.dropTarget?.(value) ?? `dnd:${ctx.id}:drop-target:${value}`

export const getDropIndicatorId = (ctx: Scope, value: string, placement: DropPlacement) =>
  ctx.ids?.dropIndicator?.(value, placement) ?? `dnd:${ctx.id}:drop-indicator:${value}:${placement}`

/* -----------------------------------------------------------------------------
 * Element lookups
 * -----------------------------------------------------------------------------*/

export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))

export const getDraggableEl = (ctx: Scope, value: string) =>
  ctx.query(`${ctx.selector(parts.draggable)}[data-value="${CSS.escape(value)}"]`)

export const getDropTargetEl = (ctx: Scope, value: string) =>
  ctx.query(`${ctx.selector(parts.dropTarget)}[data-value="${CSS.escape(value)}"]`)

export const getDropTargetEls = (ctx: Scope): HTMLElement[] => ctx.queryAll(ctx.selector(parts.dropTarget))

export const getDraggableEls = (ctx: Scope): HTMLElement[] => ctx.queryAll(ctx.selector(parts.draggable))

/* -----------------------------------------------------------------------------
 * Rect collection for collision detection
 * -----------------------------------------------------------------------------*/

export function getDropEntries(ctx: Scope): DropEntry[] {
  const els = getDropTargetEls(ctx)
  const entries: DropEntry[] = []
  for (const el of els) {
    const value = el.dataset.value
    if (!value) continue
    entries.push({ value, rect: getElementRect(el) })
  }
  return entries
}

/* -----------------------------------------------------------------------------
 * Focus utilities
 * -----------------------------------------------------------------------------*/

export function focusDraggable(ctx: Scope, value: string) {
  const el = getDraggableEl(ctx, value)
  el?.focus({ preventScroll: true })
}

export function focusDropTarget(ctx: Scope, value: string) {
  const el = getDropTargetEl(ctx, value)
  el?.focus({ preventScroll: true })
}
