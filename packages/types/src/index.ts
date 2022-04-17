import type * as React from "react"

export type Direction = "ltr" | "rtl"

export type Orientation = "horizontal" | "vertical"

export type MaybeElement<T extends HTMLElement = HTMLElement> = T | null

export type DirectionProperty = {
  /**
   * The document's text/writing direction.
   */
  dir?: Direction
}

export type Context<T> = T & {
  /**
   * @internal
   * The unique identifier of the accordion.
   */
  uid: string
  /**
   * @internal
   * The owner document of the accordion widget.
   */
  doc?: Document
  /**
   * @internal
   * The related target when the element is blurred.
   * Used as a polyfill for `e.relatedTarget`
   */
  pointerdownNode?: HTMLElement | null
}

export type Style = React.CSSProperties & {
  [prop: string]: string | number | undefined
}

export * from "./prop-types"
export * from "./controls"
