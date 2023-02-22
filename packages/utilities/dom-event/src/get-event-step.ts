const PAGE_KEYS = new Set(["PageUp", "PageDown"])
const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"])

/**
 * Determine the step factor for keyboard events
 */
export function getEventStep(event: Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "key" | "shiftKey">) {
  if (event.ctrlKey || event.metaKey) {
    return 0.1
  } else {
    const isPageKey = PAGE_KEYS.has(event.key)
    const isSkipKey = isPageKey || (event.shiftKey && ARROW_KEYS.has(event.key))
    return isSkipKey ? 10 : 1
  }
}
