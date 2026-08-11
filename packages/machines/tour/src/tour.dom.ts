import type { Scope } from "@zag-js/core"
import { getComputedStyle, raf, setStyleProperty } from "@zag-js/dom-query"

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
