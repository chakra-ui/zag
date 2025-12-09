export interface ScrollPosition {
  scrollTop: number
  scrollLeft: number
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
  const target = (event as Event).target as HTMLElement | Window
  if (target === window) {
    return {
      scrollTop: window.scrollY,
      scrollLeft: window.scrollX,
    }
  }

  const element = target as HTMLElement
  return {
    scrollTop: element.scrollTop,
    scrollLeft: element.scrollLeft,
  }
}
