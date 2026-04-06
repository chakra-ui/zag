import type { Scope } from "@zag-js/core"
import { getTabbables, getWindow } from "@zag-js/dom-query"
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

export const getContentEls = (ctx: Scope) => ctx.queryAll(ctx.selector(parts.content))

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

export function setMotionAttr(scope: Scope, value: string | null, previousValue: string | null) {
  const triggers = getTriggerEls(scope)
  const dir = triggers[0].dir

  let values = triggers.map((trigger) => trigger.getAttribute("data-value"))
  if (dir === "rtl") values.reverse()

  const index = values.indexOf(value)
  const prevIndex = values.indexOf(previousValue)

  const contentEls = getContentEls(scope)
  contentEls.forEach((contentEl) => {
    const itemValue = contentEl.dataset.value!
    const selected = value === itemValue
    const prevSelected = prevIndex === values.indexOf(itemValue)

    if (!selected && !prevSelected) {
      delete contentEl.dataset.motion
      return
    }

    const attribute = (() => {
      // Don't provide a direction on the initial open
      if (index !== prevIndex) {
        // If we're moving to this item from another
        if (selected && prevIndex !== -1) return index > prevIndex ? "from-end" : "from-start"
        // If we're leaving this item for another
        if (prevSelected && index !== -1) return index > prevIndex ? "to-start" : "to-end"
      }
      // Otherwise we're entering from closed or leaving the list
      // entirely and should not animate in any direction
      return null
    })()

    if (attribute) {
      contentEl.dataset.motion = attribute
    } else {
      delete contentEl.dataset.motion
    }
  })
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
