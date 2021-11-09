import type { KeyboardEvent } from "react"

/* -----------------------------------------------------------------------------
 * RTL Keymap
 * -----------------------------------------------------------------------------*/

const rtlKeyMap = {
  ArrowLeft: "ArrowRight",
  ArrowRight: "ArrowLeft",
  Home: "End",
  End: "Home",
}

/* -----------------------------------------------------------------------------
 * Same keymap but with shortcuts
 * -----------------------------------------------------------------------------*/

const sameKeyMap = {
  Up: "ArrowUp",
  Down: "ArrowDown",
  Esc: "Escape",
  " ": "Space",
  ",": "Comma",
  Left: "ArrowLeft",
  Right: "ArrowRight",
}

type EventKeyOptions = {
  dir?: "ltr" | "rtl"
  orientation?: "horizontal" | "vertical"
}

/**
 * Determine the event key based on text direction.
 */
export function getEventKey(event: KeyboardEvent, options: EventKeyOptions = {}) {
  const { dir = "ltr", orientation = "horizontal" } = options

  let { key } = event
  key = sameKeyMap[key] ?? key // normalize key

  const isRtl = dir === "rtl" && orientation === "horizontal"

  if (isRtl && key in rtlKeyMap) {
    key = rtlKeyMap[key]
  }

  return key
}

const PAGE_KEYS = new Set(["PageUp", "PageDown"])
const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"])

/**
 * Determine the step factor for keyboard events
 */
export function getEventStep(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) {
    return 0.1
  } else {
    const isPageKey = PAGE_KEYS.has(event.key)
    const isSkipKey = isPageKey || (event.shiftKey && ARROW_KEYS.has(event.key))
    return isSkipKey ? 10 : 1
  }
}
