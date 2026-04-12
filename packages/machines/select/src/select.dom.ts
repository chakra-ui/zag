import type { Scope } from "@zag-js/core"
import { getComputedStyle } from "@zag-js/dom-query"
import { parts } from "./select.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `${ctx.id}:trigger`
export const getClearTriggerId = (ctx: Scope) => ctx.ids?.clearTrigger ?? `${ctx.id}:clear-trigger`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getItemId = (ctx: Scope, id: string | number) => ctx.ids?.item?.(id) ?? `${ctx.id}:option:${id}`
export const getHiddenSelectId = (ctx: Scope) => ctx.ids?.hiddenSelect ?? `${ctx.id}:select`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `${ctx.id}:positioner`
export const getItemGroupId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroup?.(id) ?? `${ctx.id}:optgroup:${id}`
export const getItemGroupLabelId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroupLabel?.(id) ?? `${ctx.id}:optgroup-label:${id}`

// Element lookups — use querySelector with merged data attributes
export const getHiddenSelectEl = (ctx: Scope) => ctx.getById<HTMLSelectElement>(getHiddenSelectId(ctx))
export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getControlEl = (ctx: Scope) => ctx.query(ctx.selector(parts.control))
export const getTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.trigger))
export const getClearTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.clearTrigger))
export const getPositionerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.positioner))
export const getValueTextEl = (ctx: Scope) => ctx.query(ctx.selector(parts.valueText))
export const getSelectedItemTextEl = (ctx: Scope) => {
  return ctx.query(`${ctx.selector(parts.itemText)}[data-state="checked"]`)
}
export const getScrollArrowEl = (ctx: Scope, placement: "top" | "bottom") => {
  return ctx.query(`${ctx.selector(parts.scrollArrow)}[data-placement="${placement}"]`)
}

const SCROLL_EDGE_TOLERANCE_PX = 1
const AUTO_SCROLL_INTERVAL_MS = 40
const SCROLL_ARROW_HEIGHT_PX = 24

export type ScrollArrowVisibility = "none" | "top" | "bottom" | "both"

export interface AutoScrollHandlers {
  start: VoidFunction
  stop: VoidFunction
}

export interface AutoScrollOptions {
  placement: "top" | "bottom"
  getScroller: () => HTMLElement | null
  getItems: () => HTMLElement[]
  getWin: () => Window
  scrollArrowHeight?: number
  interval?: number
  /** Called after each scroll tick (e.g., to trigger popup growth). */
  onStep?: VoidFunction | undefined
}

function clampScroll(value: number, max: number) {
  return Math.max(0, Math.min(max, value))
}

function getItemBoundaryScrollTop(
  items: HTMLElement[],
  isTop: boolean,
  scrollTop: number,
  clientHeight: number,
  arrowHeight: number,
  maxScrollTop: number,
): number {
  if (isTop) {
    let firstVisibleIndex = 0
    const visibleTop = scrollTop + arrowHeight - SCROLL_EDGE_TOLERANCE_PX
    for (let i = 0; i < items.length; i++) {
      if (items[i].offsetTop >= visibleTop) {
        firstVisibleIndex = i
        break
      }
    }
    const targetIndex = Math.max(0, firstVisibleIndex - 1)
    const target = items[targetIndex]
    return targetIndex < firstVisibleIndex && target ? clampScroll(target.offsetTop - arrowHeight, maxScrollTop) : 0
  }

  let lastVisibleIndex = items.length - 1
  const visibleBottom = scrollTop + clientHeight - arrowHeight + SCROLL_EDGE_TOLERANCE_PX
  for (let i = 0; i < items.length; i++) {
    if (items[i].offsetTop + items[i].offsetHeight > visibleBottom) {
      lastVisibleIndex = Math.max(0, i - 1)
      break
    }
  }
  const targetIndex = Math.min(items.length - 1, lastVisibleIndex + 1)
  const target = items[targetIndex]
  return targetIndex > lastVisibleIndex && target
    ? clampScroll(target.offsetTop + target.offsetHeight - clientHeight + arrowHeight, maxScrollTop)
    : maxScrollTop
}

export function createAutoScroll(options: AutoScrollOptions): AutoScrollHandlers {
  const { placement, getScroller, getItems, getWin } = options
  const arrowHeight = options.scrollArrowHeight ?? SCROLL_ARROW_HEIGHT_PX
  const interval = options.interval ?? AUTO_SCROLL_INTERVAL_MS
  const isTop = placement === "top"

  let timerId: number | null = null

  const stop = () => {
    if (timerId != null) {
      getWin().clearTimeout(timerId)
      timerId = null
    }
  }

  const tick = () => {
    const scroller = getScroller()
    if (!scroller) return stop()
    const { scrollTop, scrollHeight, clientHeight } = scroller
    const maxScrollTop = scrollHeight - clientHeight
    const atEdge = isTop ? scrollTop <= 0 : scrollTop >= maxScrollTop
    if (atEdge) return stop()

    const items = getItems()
    if (items.length > 0) {
      scroller.scrollTop = getItemBoundaryScrollTop(items, isTop, scrollTop, clientHeight, arrowHeight, maxScrollTop)
    } else {
      const fallbackItems = Array.from(scroller.querySelectorAll("[data-select-item]")) as HTMLElement[]
      const avgHeight =
        fallbackItems.length > 0
          ? Math.round(fallbackItems.reduce((sum, el) => sum + el.offsetHeight, 0) / fallbackItems.length)
          : 32
      scroller.scrollTop = isTop ? Math.max(0, scrollTop - avgHeight) : Math.min(maxScrollTop, scrollTop + avgHeight)
    }

    options.onStep?.()
    timerId = getWin().setTimeout(tick, interval)
  }

  const start = () => {
    if (timerId != null) return
    tick()
  }

  return { start, stop }
}

export function computeScrollArrowVisibility(scroller: HTMLElement | null): ScrollArrowVisibility {
  if (!scroller) return "none"
  const { scrollTop, scrollHeight, clientHeight } = scroller
  const maxScrollTop = scrollHeight - clientHeight
  if (maxScrollTop <= SCROLL_EDGE_TOLERANCE_PX) return "none"
  // Use content padding as edge tolerance so arrows hide when the first/last
  // item is fully visible (scrollIntoView lands at padding offset, not 0).
  const style = getComputedStyle(scroller)
  const topTolerance = Math.max(SCROLL_EDGE_TOLERANCE_PX, parseFloat(style.paddingTop) || 0)
  const bottomTolerance = Math.max(SCROLL_EDGE_TOLERANCE_PX, parseFloat(style.paddingBottom) || 0)
  const top = scrollTop > topTolerance
  const bottom = scrollTop < maxScrollTop - bottomTolerance
  if (top && bottom) return "both"
  if (top) return "top"
  if (bottom) return "bottom"
  return "none"
}
export const getItemEls = (ctx: Scope) => {
  return Array.from(ctx.queryAll(ctx.selector(parts.item))) as HTMLElement[]
}
export const getItemEl = (ctx: Scope, id: string | number | null) => {
  if (id == null) return null
  return ctx.query(`${ctx.selector(parts.item)}[data-value="${id}"]`)
}
