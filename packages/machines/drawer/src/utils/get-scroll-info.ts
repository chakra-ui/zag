import { getComputedStyle } from "@zag-js/dom-query"
import type { SwipeDirection } from "../drawer.types"
import { isVerticalSwipeDirection } from "./swipe"

const SCROLL_SLACK_EPSILON = 1

function overflowAllowsScroll(overflow: string): boolean {
  return overflow === "auto" || overflow === "scroll" || overflow === "overlay"
}

/**
 * Whether the element can be scrolled by the user on the Y axis (overflow + overflow size).
 */
export function canScrollAlongY(el: HTMLElement): boolean {
  const style = getComputedStyle(el)
  if (!overflowAllowsScroll(style.overflowY)) return false
  return el.scrollHeight > el.clientHeight + SCROLL_SLACK_EPSILON
}

/**
 * Whether the element can be scrolled by the user on the X axis.
 */
export function canScrollAlongX(el: HTMLElement): boolean {
  const style = getComputedStyle(el)
  if (!overflowAllowsScroll(style.overflowX)) return false
  return el.scrollWidth > el.clientWidth + SCROLL_SLACK_EPSILON
}

export function canScrollOnSwipeAxis(el: HTMLElement, direction: SwipeDirection): boolean {
  return isVerticalSwipeDirection(direction) ? canScrollAlongY(el) : canScrollAlongX(el)
}

/**
 * Closest scrollable ancestor on the swipe axis when walking up from `target` toward `container`
 * (does not include `container` itself).
 */
export function findClosestScrollableAncestorOnSwipeAxis(
  target: HTMLElement,
  container: HTMLElement | null,
  direction: SwipeDirection,
): HTMLElement | null {
  if (!container) return null
  let el: HTMLElement | null = target
  while (el && el !== container) {
    if (canScrollOnSwipeAxis(el, direction)) return el
    el = el.parentElement
  }
  return null
}

/**
 * Accumulated forward/backward scroll slack from `target` up to `container` on the given axis.
 */
export function getScrollInfo(target: HTMLElement, container: HTMLElement | null, direction: SwipeDirection) {
  let availableForwardScroll = 0
  let availableBackwardScroll = 0
  if (!container) {
    return { availableForwardScroll, availableBackwardScroll }
  }

  const vertical = isVerticalSwipeDirection(direction)
  let element: HTMLElement | null = target

  while (element) {
    if (vertical ? canScrollAlongY(element) : canScrollAlongX(element)) {
      const clientSize = vertical ? element.clientHeight : element.clientWidth
      const scrollPos = vertical ? element.scrollTop : element.scrollLeft
      const scrollSize = vertical ? element.scrollHeight : element.scrollWidth
      const scrolled = scrollSize - scrollPos - clientSize
      availableForwardScroll += scrolled
      availableBackwardScroll += scrollPos
    }

    if (element === container || element === element.ownerDocument.documentElement) break
    element = element.parentElement
  }

  return {
    availableForwardScroll,
    availableBackwardScroll,
  }
}

/**
 * Whether a capturing `touchmove` should call `preventDefault` so the drawer can take over
 * when a nested scroller is exhausted on the edge that aligns with dismiss direction.
 */
export function shouldPreventTouchDefaultForDrawerPull(options: {
  scrollParent: HTMLElement
  swipeDirection: SwipeDirection
  lastMainAxis: number
  currentMainAxis: number
}): boolean {
  const { scrollParent, swipeDirection, lastMainAxis, currentMainAxis } = options
  const vertical = isVerticalSwipeDirection(swipeDirection)
  const movingPositive = currentMainAxis > lastMainAxis

  if (vertical) {
    const scrollPos = scrollParent.scrollTop
    const maxScroll = Math.max(0, scrollParent.scrollHeight - scrollParent.clientHeight)

    if (swipeDirection === "down") {
      const atStart = scrollPos <= SCROLL_SLACK_EPSILON
      return atStart && movingPositive
    }

    if (swipeDirection === "up") {
      const atEnd = scrollPos >= maxScroll - SCROLL_SLACK_EPSILON
      return atEnd && !movingPositive
    }
  } else {
    const scrollPos = scrollParent.scrollLeft
    const maxScroll = Math.max(0, scrollParent.scrollWidth - scrollParent.clientWidth)

    if (swipeDirection === "right") {
      const atStart = scrollPos <= SCROLL_SLACK_EPSILON
      return atStart && movingPositive
    }

    if (swipeDirection === "left") {
      const atEnd = scrollPos >= maxScroll - SCROLL_SLACK_EPSILON
      return atEnd && !movingPositive
    }
  }

  return false
}
