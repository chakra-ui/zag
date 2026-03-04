import type { SwipeDirection } from "../drawer.types"

function isVerticalScrollContainer(element: HTMLElement) {
  const styles = getComputedStyle(element)
  const overflow = styles.overflowY

  return overflow === "auto" || overflow === "scroll"
}

function isHorizontalScrollContainer(element: HTMLElement) {
  const styles = getComputedStyle(element)
  const overflow = styles.overflowX
  return overflow === "auto" || overflow === "scroll"
}

const isVerticalDirection = (direction: SwipeDirection) => direction === "up" || direction === "down"

export function getScrollInfo(target: HTMLElement, container: HTMLElement, direction: SwipeDirection) {
  let element = target
  let availableForwardScroll = 0
  let availableBackwardScroll = 0
  const vertical = isVerticalDirection(direction)

  while (element) {
    const clientSize = vertical ? element.clientHeight : element.clientWidth
    const scrollPos = vertical ? element.scrollTop : element.scrollLeft
    const scrollSize = vertical ? element.scrollHeight : element.scrollWidth

    const scrolled = scrollSize - scrollPos - clientSize
    const isScrollable = vertical ? isVerticalScrollContainer(element) : isHorizontalScrollContainer(element)

    if ((scrollPos !== 0 || scrolled !== 0) && isScrollable) {
      availableForwardScroll += scrolled
      availableBackwardScroll += scrollPos
    }

    if (element === container || element === document.documentElement) break
    element = element.parentNode as HTMLElement
  }

  return {
    availableForwardScroll,
    availableBackwardScroll,
  }
}
