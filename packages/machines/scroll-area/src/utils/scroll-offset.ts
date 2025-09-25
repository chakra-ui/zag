import { getComputedStyle } from "@zag-js/dom-query"

export function getScrollOffset(
  element: HTMLElement | null | undefined,
  prop: "margin" | "padding",
  axis: "x" | "y",
): number {
  if (!element) return 0
  const styles = getComputedStyle(element)
  const propAxis = axis === "x" ? "Inline" : "Block"

  // Safari has a bug with `marginInlineEnd` in RTL layouts.
  // As a workaround, we double the start value assuming symmetrical margins.
  if (axis === "x" && prop === "margin") {
    return parseFloat(styles[`${prop}InlineStart`]) * 2
  }

  return parseFloat(styles[`${prop}${propAxis}Start`]) + parseFloat(styles[`${prop}${propAxis}End`])
}
