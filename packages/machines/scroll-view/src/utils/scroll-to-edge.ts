import type { Direction } from "@zag-js/types"
import type { ScrollEasingOptions, ScrollToEdge } from "../scroll-view.types"
import { scrollUntil } from "./scroll-until"

export function scrollToEdge(
  node: HTMLElement | null | undefined,
  edge: ScrollToEdge,
  dir?: Direction,
  options: ScrollEasingOptions | undefined = {},
): Promise<boolean> {
  if (!node) return Promise.resolve(false)

  const maxLeft = node.scrollWidth - node.clientWidth
  const maxTop = node.scrollHeight - node.clientHeight
  const isRtl = dir === "rtl"

  let targetScrollTop: number | undefined
  let targetScrollLeft: number | undefined

  switch (edge) {
    case "top":
      targetScrollTop = 0
      break
    case "bottom":
      targetScrollTop = maxTop
      break
    case "left":
      if (isRtl) {
        const negative = node.scrollLeft <= 0
        targetScrollLeft = negative ? -maxLeft : 0
      } else {
        targetScrollLeft = 0
      }
      break
    case "right":
      if (isRtl) {
        const negative = node.scrollLeft <= 0
        targetScrollLeft = negative ? 0 : maxLeft
      } else {
        targetScrollLeft = maxLeft
      }
      break
  }

  const condition = () => {
    if (targetScrollTop !== undefined) {
      return Math.abs(node.scrollTop - targetScrollTop) < 1
    }
    if (targetScrollLeft !== undefined) {
      return Math.abs(node.scrollLeft - targetScrollLeft) < 1
    }
    return true
  }

  return scrollUntil(node, condition, {
    ...options,
    ...(targetScrollTop !== undefined && { targetScrollTop }),
    ...(targetScrollLeft !== undefined && { targetScrollLeft }),
    easing: options.easing || ((t: number) => 1 - Math.pow(1 - t, 3)), // easeOutCubic
  })
}
