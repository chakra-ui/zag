import type * as R from "react"

export type Dict<T = any> = Record<string, T>

export type Direction = "ltr" | "rtl"

export type Orientation = "horizontal" | "vertical"

type Key =
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

export type EventKeyMap = Partial<Record<Key, (event: R.KeyboardEvent) => void>>

export type Context<T> = T & {
  /**
   * The unique identifier of the accordion.
   */
  uid: string
  /**
   * The owner document of the accordion widget.
   */
  doc?: Document
  /**
   * The related target when the element is blurred.
   * Used as a polyfill for `e.relatedTarget`
   */
  pointerdownNode?: HTMLElement | null
  /**
   * The document's text/writing direction.
   */
  dir?: Direction
}

export type Style = R.CSSProperties & {
  [prop: string]: string | number | undefined
}
