import type { EventKeyOptions } from "./types"

const keyMap: Record<string, string> = {
  Up: "ArrowUp",
  Down: "ArrowDown",
  Esc: "Escape",
  " ": "Space",
  ",": "Comma",
  Left: "ArrowLeft",
  Right: "ArrowRight",
}

const rtlKeyMap: Record<string, string> = {
  ArrowLeft: "ArrowRight",
  ArrowRight: "ArrowLeft",
}

/**
 * Determine the event key based on text direction.
 */
export function getEventKey(event: Pick<KeyboardEvent, "key">, options: EventKeyOptions = {}) {
  const { dir = "ltr", orientation = "horizontal" } = options

  let { key } = event
  key = keyMap[key] ?? key // normalize key

  const isRtl = dir === "rtl" && orientation === "horizontal"

  if (isRtl && key in rtlKeyMap) {
    key = rtlKeyMap[key]
  }

  return key
}
