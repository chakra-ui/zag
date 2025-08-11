import type { ScrollToDetails } from "../scroll-view.types"
import { scrollUntil } from "./scroll-until"

export function scrollTo(node: HTMLElement | null | undefined, options: ScrollToDetails = {}): Promise<boolean> {
  if (!node) return Promise.resolve(false)
  const { top, left, easing, duration } = options
  const condition = () => {
    const topReached = top === undefined || Math.abs(node.scrollTop - top) < 1
    const leftReached = left === undefined || Math.abs(node.scrollLeft - left) < 1
    return topReached && leftReached
  }
  return scrollUntil(node, condition, {
    targetScrollTop: top,
    targetScrollLeft: left,
    easing: easing || ((t: number) => 1 - Math.pow(1 - t, 3)), // easeOutCubic
    duration,
  })
}
