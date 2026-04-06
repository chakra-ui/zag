import type { Scope } from "@zag-js/core"
import { isHTMLElement, queryAll } from "@zag-js/dom-query"
import { isFunction } from "@zag-js/utils"
import { parts } from "./drawer.anatomy"

export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `${ctx.id}:positioner`
export const getTitleId = (ctx: Scope) => ctx.ids?.title ?? `${ctx.id}:title`
export const getDescriptionId = (ctx: Scope) => ctx.ids?.description ?? `${ctx.id}:description`
export const getTriggerId = (ctx: Scope, value?: string) => {
  const customId = ctx.ids?.trigger
  if (customId != null) return isFunction(customId) ? customId(value) : customId
  return value ? `${ctx.id}:trigger:${value}` : `${ctx.id}:trigger`
}

export const getTriggerEls = (ctx: Scope): HTMLElement[] => ctx.queryAll<HTMLElement>(ctx.selector(parts.trigger))

export const getActiveTriggerEl = (ctx: Scope, value: string | null): HTMLElement | null => {
  if (value == null) return getTriggerEl(ctx) ?? getTriggerEls(ctx)[0]
  return ctx.getById(getTriggerId(ctx, value))
}
export const getBackdropId = (ctx: Scope) => ctx.ids?.backdrop ?? `${ctx.id}:backdrop`
export const getHeaderId = (ctx: Scope) => ctx.ids?.header ?? `${ctx.id}:header`
export const getGrabberId = (ctx: Scope) => ctx.ids?.grabber ?? `${ctx.id}:grabber`
export const getGrabberIndicatorId = (ctx: Scope) => ctx.ids?.grabberIndicator ?? `${ctx.id}:grabber-indicator`
export const getCloseTriggerId = (ctx: Scope) => ctx.ids?.closeTrigger ?? `${ctx.id}:close-trigger`
export const getSwipeAreaId = (ctx: Scope) => ctx.ids?.swipeArea ?? `${ctx.id}:swipe-area`

export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getPositionerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.positioner))
export const getTitleEl = (ctx: Scope) => ctx.query(ctx.selector(parts.title))
export const getDescriptionEl = (ctx: Scope) => ctx.query(ctx.selector(parts.description))
export const getTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.trigger))
export const getBackdropEl = (ctx: Scope) => ctx.query(ctx.selector(parts.backdrop))
export const getHeaderEl = (ctx: Scope) => ctx.getById(getHeaderId(ctx))
export const getGrabberEl = (ctx: Scope) => ctx.query(ctx.selector(parts.grabber))
export const getGrabberIndicatorEl = (ctx: Scope) => ctx.query(ctx.selector(parts.grabberIndicator))
export const getCloseTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.closeTrigger))
export const getSwipeAreaEl = (ctx: Scope) => ctx.query(ctx.selector(parts.swipeArea))

/** Whether the event target lies inside the drawer content or swipe-area subtree. */
export function isPointerWithinContentOrSwipeArea(
  target: EventTarget | null,
  content: HTMLElement | null,
  swipeArea: HTMLElement | null,
): boolean {
  if (!isHTMLElement(target)) return false
  return Boolean((content && content.contains(target)) || (swipeArea && swipeArea.contains(target)))
}

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
