import type { JSX } from "@zag-js/types"

export type EventKey =
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

export type EventKeyMap = {
  [key in EventKey]?: (event: JSX.KeyboardEvent) => void
}

export interface EventKeyOptions {
  dir?: "ltr" | "rtl"
  orientation?: "horizontal" | "vertical"
}
