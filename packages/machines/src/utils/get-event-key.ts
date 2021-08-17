import type { KeyboardEvent } from "react"

const keyMap = {
  ArrowLeft: "ArrowRight",
  ArrowRight: "ArrowLeft",
  Home: "End",
  End: "Home",
}

type EventKeyOptions = {
  direction?: "ltr" | "rtl"
  orientation?: "horizontal" | "vertical"
}

/**
 * Determine the event key based on text direction.
 */
export function getEventKey(event: KeyboardEvent, options: EventKeyOptions) {
  let { key } = event
  const { direction, orientation = "horizontal" } = options

  const isRtl = direction === "rtl" && orientation === "horizontal"
  if (isRtl && key in keyMap) key = keyMap[key]

  return key
}
