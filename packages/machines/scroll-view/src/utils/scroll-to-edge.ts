import type { Direction } from "@zag-js/types"
import type { ScrollToEdge } from "../scroll-view.types"

export function scrollToEdge(node: HTMLElement | null | undefined, edge: ScrollToEdge, dir?: Direction) {
  if (!node) return
  const maxLeft = node.scrollWidth - node.clientWidth
  const maxTop = node.scrollHeight - node.clientHeight
  const isRtl = dir === "rtl"

  switch (edge) {
    case "top":
      node.scrollTop = 0
      break
    case "bottom":
      node.scrollTop = maxTop
      break
    case "left":
      if (isRtl) {
        const negative = node.scrollLeft <= 0
        node.scrollLeft = negative ? -maxLeft : 0
      } else {
        node.scrollLeft = 0
      }
      break
    case "right":
      if (isRtl) {
        const negative = node.scrollLeft <= 0
        node.scrollLeft = negative ? 0 : maxLeft
      } else {
        node.scrollLeft = maxLeft
      }
      break
  }
}
