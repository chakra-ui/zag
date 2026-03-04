import type { Scope } from "@zag-js/core"
import { queryAll } from "@zag-js/dom-query"

export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `drawer:${ctx.id}:content`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `drawer:${ctx.id}:positioner`
export const getTitleId = (ctx: Scope) => ctx.ids?.title ?? `drawer:${ctx.id}:title`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `drawer:${ctx.id}:trigger`
export const getBackdropId = (ctx: Scope) => ctx.ids?.backdrop ?? `drawer:${ctx.id}:backdrop`
export const getHeaderId = (ctx: Scope) => ctx.ids?.header ?? `drawer:${ctx.id}:header`
export const getGrabberId = (ctx: Scope) => ctx.ids?.grabber ?? `drawer:${ctx.id}:grabber`
export const getGrabberIndicatorId = (ctx: Scope) => ctx.ids?.grabberIndicator ?? `drawer:${ctx.id}:grabber-indicator`
export const getCloseTriggerId = (ctx: Scope) => ctx.ids?.closeTrigger ?? `drawer:${ctx.id}:close-trigger`

export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getPositionerEl = (ctx: Scope) => ctx.getById(getPositionerId(ctx))
export const getTriggerEl = (ctx: Scope) => ctx.getById(getTriggerId(ctx))
export const getBackdropEl = (ctx: Scope) => ctx.getById(getBackdropId(ctx))
export const getHeaderEl = (ctx: Scope) => ctx.getById(getHeaderId(ctx))
export const getGrabberEl = (ctx: Scope) => ctx.getById(getGrabberId(ctx))
export const getGrabberIndicatorEl = (ctx: Scope) => ctx.getById(getGrabberIndicatorId(ctx))
export const getCloseTriggerEl = (ctx: Scope) => ctx.getById(getCloseTriggerId(ctx))

export const getScrollEls = (scope: Scope) => {
  const els: Record<"x" | "y", HTMLElement[]> = { x: [], y: [] }

  const contentEl = getContentEl(scope)
  if (!contentEl) return els

  const nodes = queryAll(contentEl, "*")
  nodes.forEach((node) => {
    const y = node.scrollHeight > node.clientHeight
    if (y) els.y.push(node)

    const x = node.scrollWidth > node.clientWidth
    if (x) els.x.push(node)
  })

  return els
}
