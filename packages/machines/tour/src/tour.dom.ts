import type { Scope } from "@zag-js/core"
import { getComputedStyle, raf, setStyleProperty } from "@zag-js/dom-query"
import { parts } from "./tour.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `${ctx.id}:positioner`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`
export const getTitleId = (ctx: Scope) => ctx.ids?.title ?? `${ctx.id}:title`
export const getDescriptionId = (ctx: Scope) => ctx.ids?.description ?? `${ctx.id}:desc`
export const getArrowId = (ctx: Scope) => ctx.ids?.arrow ?? `${ctx.id}:arrow`
export const getBackdropId = (ctx: Scope) => ctx.ids?.backdrop ?? `${ctx.id}:backdrop`

// Element lookups — use querySelector with merged data attributes
export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getPositionerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.positioner))
export const getBackdropEl = (ctx: Scope) => ctx.query(ctx.selector(parts.backdrop))

export function syncZIndex(scope: Scope) {
  const restores: VoidFunction[] = []

  const cancel = raf(() => {
    const contentEl = getContentEl(scope)
    if (!contentEl) return

    const zIndex = getComputedStyle(contentEl).zIndex
    if (!zIndex || zIndex === "auto") return

    const positionerEl = getPositionerEl(scope)
    if (!positionerEl) return

    restores.push(
      setStyleProperty(positionerEl, "--z-index", zIndex),
      setStyleProperty(positionerEl, "z-index", "var(--z-index)"),
    )
  })

  return () => {
    cancel()
    restores.forEach((restore) => restore())
  }
}
