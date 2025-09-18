import type { Direction } from "@zag-js/types"
import { compact } from "@zag-js/utils"
import type { ScrollToEdge } from "../scroll-area.types"
import { smoothScroll } from "./smooth-scroll"

export function scrollToEdge(
  node: HTMLElement | null | undefined,
  edge: ScrollToEdge,
  dir?: Direction,
  behavior: ScrollBehavior = "smooth",
  easing?: (t: number) => number,
  duration?: number,
): void {
  if (!node) return

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

  if (behavior === "smooth") {
    smoothScroll(node, { top: targetScrollTop, left: targetScrollLeft, easing, duration })
  } else {
    const options = compact({ left: targetScrollLeft, top: targetScrollTop, behavior })

    node.scrollTo(options as ScrollToOptions)
  }
}
