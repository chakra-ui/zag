import type { KeyboardEvent } from "react"

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
  Left: "ArrowLeft",
  Right: "ArrowRight",
}

type EventKeyOptions = {
  direction?: "ltr" | "rtl"
  orientation?: "horizontal" | "vertical"
}

/**
 * Determine the event key based on text direction.
 */
export function getEventKey(event: KeyboardEvent, options: EventKeyOptions = {}) {
  const { direction = "ltr", orientation = "horizontal" } = options

  let { key } = event
  key = sameKeyMap[key] ?? key // normalize key

  const isRtl = direction === "rtl" && orientation === "horizontal"

  if (isRtl && key in rtlKeyMap) {
    key = rtlKeyMap[key]
  }

  return key
}
