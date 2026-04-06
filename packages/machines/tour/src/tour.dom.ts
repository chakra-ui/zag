import type { Scope } from "@zag-js/core"
import { getComputedStyle, raf } from "@zag-js/dom-query"
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
  return raf(() => {
    // sync z-index of positioner with content
    const contentEl = getContentEl(scope)
    if (!contentEl) return

    const styles = getComputedStyle(contentEl)
    const positionerEl = getPositionerEl(scope)
    const backdropEl = getBackdropEl(scope)

    if (positionerEl) {
      positionerEl.style.setProperty("--z-index", styles.zIndex)
      positionerEl.style.setProperty("z-index", "var(--z-index)")
    }

    if (backdropEl) {
      backdropEl.style.setProperty("--z-index", styles.zIndex)
    }
  })
}
