import type { KeyboardEvent } from "react"

const keyMap = {
  ArrowLeft: "ArrowRight",
  ArrowRight: "ArrowLeft",
  Home: "End",
  End: "Home",
}

/**
 * Determine the event key based on text direction.
 */
export function determineEventKey(
  event: KeyboardEvent,
  options: {
    direction?: "ltr" | "rtl"
    orientation?: "horizontal" | "vertical"
  },
) {
  let { key } = event
  const { direction, orientation = "horizontal" } = options

  const isRtl = direction === "rtl" && orientation === "horizontal"

  if (isRtl && key in keyMap) {
    key = keyMap[key]
  }

  return key
}

const PAGE_KEYS = ["PageUp", "PageDown"]
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]

/**
 * Determine the step factor for keyboard events
 */
export function getStepMultipler(event: KeyboardEvent) {
  const isPageKey = PAGE_KEYS.includes(event.key)
  const isSkipKey =
    isPageKey || (event.shiftKey && ARROW_KEYS.includes(event.key))
  return isSkipKey ? 10 : 1
}

type Booleanish = boolean | "true" | "false"

export const dataAttr = (cond: boolean | undefined) => {
  return (cond ? "" : undefined) as Booleanish
}

export const ariaAttr = (cond: boolean | undefined) => {
  return cond ? true : undefined
}
