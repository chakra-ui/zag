export function getScrollProgress(element: HTMLElement | null, scrollThreshold: number): { x: number; y: number } {
  if (!element) return EMPTY_SCROLL_PROGRESS
  let progressX = 0
  let progressY = 0

  // Calculate horizontal scroll progress
  const maxScrollX = element.scrollWidth - element.clientWidth
  if (maxScrollX > scrollThreshold) {
    progressX = Math.min(1, Math.max(0, element.scrollLeft / maxScrollX))
  }

  // Calculate vertical scroll progress
  const maxScrollY = element.scrollHeight - element.clientHeight
  if (maxScrollY > scrollThreshold) {
    progressY = Math.min(1, Math.max(0, element.scrollTop / maxScrollY))
  }

  return { x: progressX, y: progressY }
}

const EMPTY_SCROLL_PROGRESS = { x: 0, y: 0 }
