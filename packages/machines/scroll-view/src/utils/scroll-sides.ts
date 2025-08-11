export function getScrollSides(node: HTMLElement, dir?: "ltr" | "rtl") {
  const scrollTop = node.scrollTop
  const scrollLeft = node.scrollLeft
  const isRtl = dir === "rtl"

  // Small threshold to account for sub-pixel rendering differences
  const threshold = 1

  // Determine if there's actual scrollable content in each direction
  const hasVerticalScroll = node.scrollHeight - node.clientHeight > threshold
  const hasHorizontalScroll = node.scrollWidth - node.clientWidth > threshold

  const maxScrollLeft = node.scrollWidth - node.clientWidth
  const maxScrollTop = node.scrollHeight - node.clientHeight

  let atLeft = false
  let atRight = false
  let atTop = false
  let atBottom = false

  // Only calculate horizontal sides if there's horizontal overflow
  if (hasHorizontalScroll) {
    if (isRtl) {
      // Handle RTL scroll position detection
      if (scrollLeft <= 0) {
        // Chrome/Safari RTL behavior (negative scrollLeft)
        atLeft = Math.abs(scrollLeft) >= maxScrollLeft - threshold
        atRight = Math.abs(scrollLeft) <= threshold
      } else {
        // Firefox RTL behavior (positive scrollLeft)
        atLeft = scrollLeft <= threshold
        atRight = scrollLeft >= maxScrollLeft - threshold
      }
    } else {
      // Standard LTR behavior
      atLeft = scrollLeft <= threshold
      atRight = scrollLeft >= maxScrollLeft - threshold
    }
  }

  // Only calculate vertical sides if there's vertical overflow
  if (hasVerticalScroll) {
    atTop = scrollTop <= threshold
    atBottom = scrollTop >= maxScrollTop - threshold
  }

  return {
    top: atTop,
    right: atRight,
    bottom: atBottom,
    left: atLeft,
  }
}
