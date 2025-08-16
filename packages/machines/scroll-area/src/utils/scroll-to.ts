import { compact } from "@zag-js/utils"
import type { ScrollToDetails } from "../scroll-area.types"
import { smoothScroll } from "./smooth-scroll"

export function scrollTo(node: HTMLElement | null | undefined, options: ScrollToDetails = {}): void {
  if (!node) return
  const { top, left, behavior = "smooth", easing, duration } = options
  if (behavior === "smooth") {
    smoothScroll(node, { top, left, easing, duration })
  } else {
    const scrollOptions = compact({ behavior, top, left })
    node.scrollTo(scrollOptions as ScrollToOptions)
  }
}
