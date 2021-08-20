import type { KeyboardEvent } from "react"

const PAGE_KEYS = new Set(["PageUp", "PageDown"])
const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"])

/**
 * Determine the step factor for keyboard events
 */
export function getEventStep(event: KeyboardEvent) {
  const isPageKey = PAGE_KEYS.has(event.key)
  const isSkipKey = isPageKey || (event.shiftKey && ARROW_KEYS.has(event.key))
  return isSkipKey ? 10 : 1
}
