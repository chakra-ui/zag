import type * as React from "react"

export type Direction = "ltr" | "rtl"

export type Orientation = "horizontal" | "vertical"

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

export type EventKeyMap = Partial<Record<EventKey, (event: React.KeyboardEvent) => void>>

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

export type Style = React.CSSProperties & {
  [prop: string]: string | number | undefined
}

export * from "./prop-types"

export function getNativeEvent<E>(event: E): E extends React.SyntheticEvent<any, infer T> ? T : never {
  return (event as any).nativeEvent ?? event
}
