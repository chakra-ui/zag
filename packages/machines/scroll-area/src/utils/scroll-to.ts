import { compact } from "@zag-js/utils"
import type { ScrollToDetails } from "../scroll-area.types"

export function scrollTo(node: HTMLElement | null | undefined, options: ScrollToDetails = {}): void {
  if (!node) return
  const { top, left, behavior = "smooth" } = options
  const scrollOptions = compact({ behavior, top, left })
  node.scrollTo(scrollOptions as ScrollToOptions)
}
