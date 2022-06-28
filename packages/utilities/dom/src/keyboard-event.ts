import type { JSX } from "@zag-js/types"

type EventKey =
  | "ArrowDown"
  | "ArrowUp"
  | "ArrowLeft"
  | "ArrowRight"
  | "Space"
  | "Enter"
  | "Comma"
  | "Escape"
  | "Backspace"
  | "Delete"
  | "Home"
  | "End"
  | "Tab"
  | "PageUp"
  | "PageDown"
  | (string & {})

export type EventKeyMap = Partial<Record<EventKey, (event: JSX.KeyboardEvent) => void>>

const rtlKeyMap = {
  ArrowLeft: "ArrowRight",
  ArrowRight: "ArrowLeft",
  Home: "End",
  End: "Home",
}

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
export function getEventKey(event: Pick<KeyboardEvent, "key">, options: EventKeyOptions = {}) {
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
export function getEventStep(event: Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "key" | "shiftKey">) {
  if (event.ctrlKey || event.metaKey) {
    return 0.1
  } else {
    const isPageKey = PAGE_KEYS.has(event.key)
    const isSkipKey = isPageKey || (event.shiftKey && ARROW_KEYS.has(event.key))
    return isSkipKey ? 10 : 1
  }
}
