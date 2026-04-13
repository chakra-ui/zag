import { isWindow } from "@zag-js/dom-query"

export interface ScrollPosition {
  scrollTop: number
  scrollLeft: number
}

export type ScrollTarget = HTMLElement | Window

/**
 * Input type for setters. With `exactOptionalPropertyTypes: true`, callers can end up with
 * `number | undefined` values for optional properties; we treat `undefined` as "no-op".
 */
export interface ScrollPositionInput {
  scrollTop?: number | undefined
  scrollLeft?: number | undefined
}

/**
 * Read scroll position from a scroll container (HTMLElement or Window).
 */
export function getScrollPosition(v: ScrollTarget): ScrollPosition {
  if (isWindow(v)) return { scrollTop: v.scrollY, scrollLeft: v.scrollX }
  return { scrollTop: v.scrollTop, scrollLeft: v.scrollLeft }
}

/**
 * Set scroll position on a scroll container (HTMLElement or Window).
 *
 * - Uses `scrollTo` when available to avoid accidentally resetting the other axis.
 * - Accepts partial updates (e.g. only scrollTop).
 */
export function setScrollPosition(target: ScrollTarget, next: ScrollPositionInput): void {
  const current = getScrollPosition(target)
  const scrollTop = next.scrollTop ?? current.scrollTop
  const scrollLeft = next.scrollLeft ?? current.scrollLeft

  if (isWindow(target)) {
    target.scrollTo(scrollLeft, scrollTop)
    return
  }

  const element = target
  if (typeof element.scrollTo === "function") {
    element.scrollTo({ top: scrollTop, left: scrollLeft })
  } else {
    element.scrollTop = scrollTop
    element.scrollLeft = scrollLeft
  }
}

/**
 * Extract scroll position from various event types.
 * Handles both native DOM events and React-style synthetic events.
 */
export function getScrollPositionFromEvent(
  event: Event | { currentTarget: { scrollTop: number; scrollLeft: number } },
): ScrollPosition {
  // React-style event with currentTarget
  if ("currentTarget" in event && event.currentTarget && "scrollTop" in event.currentTarget) {
    return {
      scrollTop: event.currentTarget.scrollTop,
      scrollLeft: event.currentTarget.scrollLeft,
    }
  }

  // Native DOM event
  const target = (event as Event).target as ScrollTarget
  return getScrollPosition(target)
}
