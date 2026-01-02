import type { Scope } from "@zag-js/core"
import { getComputedStyle, raf } from "@zag-js/dom-query"

export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `tour-positioner-${ctx.id}`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `tour-content-${ctx.id}`
export const getTitleId = (ctx: Scope) => ctx.ids?.title ?? `tour-title-${ctx.id}`
export const getDescriptionId = (ctx: Scope) => ctx.ids?.description ?? `tour-desc-${ctx.id}`
export const getArrowId = (ctx: Scope) => ctx.ids?.arrow ?? `tour-arrow-${ctx.id}`
export const getBackdropId = (ctx: Scope) => ctx.ids?.backdrop ?? `tour-backdrop-${ctx.id}`
export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getPositionerEl = (ctx: Scope) => ctx.getById(getPositionerId(ctx))
export const getBackdropEl = (ctx: Scope) => ctx.getById(getBackdropId(ctx))

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
