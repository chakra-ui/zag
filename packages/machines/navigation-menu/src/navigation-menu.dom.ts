import type { Scope } from "@zag-js/core"
import { getRelativeDirection, getTabbables, getWindow } from "@zag-js/dom-query"
import type { ActivationDirection, Orientation } from "@zag-js/types"
import { parts } from "./navigation-menu.anatomy"

// ID generators — only for parts referenced by ARIA attributes
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getTriggerId = (ctx: Scope, value: string) => ctx.ids?.trigger?.(value) ?? `${ctx.id}:trigger:${value}`
export const getTriggerProxyId = (ctx: Scope, value: string) =>
  ctx.ids?.triggerProxy?.(value) ?? `${ctx.id}:trigger-proxy:${value}`
export const getContentId = (ctx: Scope, value: string) => ctx.ids?.content?.(value) ?? `${ctx.id}:content:${value}`
export const getViewportId = (ctx: Scope) => ctx.ids?.viewport ?? `${ctx.id}:viewport`
export const getListId = (ctx: Scope) => ctx.ids?.list ?? `${ctx.id}:list`
export const getItemId = (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `${ctx.id}:item:${value}`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getViewportEl = (ctx: Scope) => ctx.query(ctx.selector(parts.viewport))

export const getTriggerEl = (ctx: Scope, value: string | null) => {
  if (!value) return null
  return ctx.query(`${ctx.selector(parts.trigger)}[data-value="${value}"]`)
}
export const getTriggerProxyEl = (ctx: Scope, value: string | null) => {
  if (!value) return null
  return ctx.getById(getTriggerProxyId(ctx, value))
}

export const getListEl = (ctx: Scope) => ctx.query(ctx.selector(parts.list))

export const getContentEl = (ctx: Scope, value: string | null) => {
  if (!value) return null
  return ctx.query(`${ctx.selector(parts.content)}[data-value="${value}"]`)
}

export const getTabbableEls = (ctx: Scope, value: string) => {
  return getTabbables(getContentEl(ctx, value))
}

export const getTriggerEls = (ctx: Scope) => ctx.queryAll<HTMLElement>(ctx.selector(parts.trigger))

export const getLinkEls = (ctx: Scope, value: string) => {
  const contentEl = getContentEl(ctx, value)
  return contentEl ? Array.from(contentEl.querySelectorAll<HTMLElement>(`[${parts.link.attr}="${ctx.id}"]`)) : []
}

export const getElements = (ctx: Scope) => {
  const listEl = getListEl(ctx)
  if (!listEl) return []
  const topLevelTriggerSelector = `[${parts.trigger.attr}="${ctx.id}"]:not([data-disabled])`
  const topLevelLinkSelector = `[${parts.item.attr}="${ctx.id}"] > [${parts.link.attr}="${ctx.id}"]`
  return Array.from(listEl.querySelectorAll<HTMLElement>(`${topLevelTriggerSelector}, ${topLevelLinkSelector}`))
}

export function trackResizeObserver(element: Array<HTMLElement | null>, onResize: () => void) {
  if (!element.length) return
  let frame = 0
  const win = getWindow(element[0])
  const obs = new win.ResizeObserver(() => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(onResize)
  })

  element.forEach((el) => {
    if (el) obs.observe(el)
  })

  return () => {
    cancelAnimationFrame(frame)
    element.forEach((el) => {
      if (el) obs.unobserve(el)
    })
  }
}

export function focusFirst(scope: Scope, candidates: HTMLElement[]) {
  const previouslyFocusedElement = scope.getActiveElement()
  return candidates.some((candidate) => {
    if (candidate === previouslyFocusedElement) return true
    candidate.focus()
    return scope.getActiveElement() !== previouslyFocusedElement
  })
}

export function removeFromTabOrder(candidates: HTMLElement[]) {
  candidates.forEach((candidate) => {
    candidate.dataset.tabindex = candidate.getAttribute("tabindex") || ""
    candidate.setAttribute("tabindex", "-1")
  })
  return () => {
    candidates.forEach((candidate) => {
      const prevTabIndex = candidate.dataset.tabindex as string
      candidate.setAttribute("tabindex", prevTabIndex)
    })
  }
}

export function getActivationDirection(
  scope: Scope,
  from: string | null,
  to: string | null,
  orientation: Orientation,
): ActivationDirection {
  if (!from || !to) return "none"
  return getRelativeDirection(getTriggerEl(scope, from), getTriggerEl(scope, to), { orientation })
}
