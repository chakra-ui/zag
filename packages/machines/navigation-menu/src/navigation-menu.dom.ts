import type { Scope } from "@zag-js/core"
import { getTabbables, getWindow, queryAll } from "@zag-js/dom-query"
import { first, last, next, nextIndex, prev, prevIndex } from "@zag-js/utils"
import type { NavigationMenuService } from "./navigation-menu.types"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `nav-menu:${ctx.id}`

export const getTriggerId = (ctx: Scope, value: string) =>
  ctx.ids?.trigger?.(value) ?? `nav-menu:${ctx.id}:trigger:${value}`

export const getContentId = (ctx: Scope, value: string) =>
  ctx.ids?.content?.(value) ?? `nav-menu:${ctx.id}:content:${value}`

export const getViewportId = (ctx: Scope) => ctx.ids?.viewport ?? `nav-menu:${ctx.id}:viewport`

export const getListId = (ctx: Scope) => ctx.ids?.list ?? `nav-menu:${ctx.id}:list`

export const getIndicatorTrackId = (ctx: Scope) => ctx.ids?.indicatorTrack ?? `nav-menu:${ctx.id}:indicator-track`

export const getRootMenuEl = (ctx: Scope, parent?: NavigationMenuService) => {
  let id = ctx.id
  while (parent != null) id = parent.prop("id")
  return ctx.getById(`nav-menu:${id}`)
}

export const getTabbableEls = (ctx: Scope, value: string) => getTabbables(getContentEl(ctx, value))
export const getIndicatorTrackEl = (ctx: Scope) => ctx.getById(getIndicatorTrackId(ctx))
export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getViewportEl = (ctx: Scope) => ctx.getById(getViewportId(ctx))
export const getTriggerEl = (ctx: Scope, value: string) => ctx.getById(getTriggerId(ctx, value))
export const getListEl = (ctx: Scope) => ctx.getById(getListId(ctx))

export const getContentEl = (ctx: Scope, value: string) => ctx.getById(getContentId(ctx, value))
export const getContentEls = (ctx: Scope) =>
  queryAll(ctx.getDoc(), `[data-scope=navigation-menu][data-part=content][data-uid='${ctx.id}']`)

export const getTriggerEls = (ctx: Scope) => queryAll(getListEl(ctx), `[data-part=trigger][data-uid='${ctx.id}']`)
export const getTopLevelEls = (ctx: Scope) => {
  const topLevelTriggerSelector = `[data-part=trigger][data-uid='${ctx.id}']:not([data-disabled])`
  const topLevelLinkSelector = `[data-part=item] > [data-part=link]`
  return queryAll(getListEl(ctx), `${topLevelTriggerSelector}, ${topLevelLinkSelector}`)
}

export const getFirstTopLevelEl = (ctx: Scope) => first(getTopLevelEls(ctx))
export const getLastTopLevelEl = (ctx: Scope) => last(getTopLevelEls(ctx))
export const getNextTopLevelEl = (ctx: Scope, value: string) => {
  const elements = getTopLevelEls(ctx)
  const values = toValues(elements)
  const idx = nextIndex(values, values.indexOf(value), { loop: false })
  return elements[idx]
}

export const getPrevTopLevelEl = (ctx: Scope, value: string) => {
  const elements = getTopLevelEls(ctx)
  const values = toValues(elements)
  const idx = prevIndex(values, values.indexOf(value), { loop: false })
  return elements[idx]
}

export const getLinkEls = (ctx: Scope, value: string) => {
  const contentEl = getContentEl(ctx, value)
  return queryAll(contentEl, `[data-part=link][data-ownedby="${getContentId(ctx, value)}"]`)
}

export const getFirstLinkEl = (ctx: Scope, value: string) => first(getLinkEls(ctx, value))
export const getLastLinkEl = (ctx: Scope, value: string) => last(getLinkEls(ctx, value))
export const getNextLinkEl = (ctx: Scope, value: string, node: HTMLElement) => {
  const elements = getLinkEls(ctx, value)
  return next(elements, elements.indexOf(node), { loop: false })
}

export const getPrevLinkEl = (ctx: Scope, value: string, node: HTMLElement) => {
  const elements = getLinkEls(ctx, value)
  return prev(elements, elements.indexOf(node), { loop: false })
}

const toValues = (els: HTMLElement[]) => els.map((el) => el.getAttribute("data-value"))

export function trackResizeObserver(element: HTMLElement | null, onResize: () => void) {
  if (!element) return null
  let frame = 0
  const win = getWindow(element)
  const obs = new win.ResizeObserver(() => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(onResize)
  })

  obs.observe(element)

  return () => {
    cancelAnimationFrame(frame)
    obs.unobserve(element)
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
