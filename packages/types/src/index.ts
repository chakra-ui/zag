import type { JSX } from "./jsx"

export type Direction = "ltr" | "rtl"

export type Orientation = "horizontal" | "vertical"

export type MaybeElement<T extends HTMLElement = HTMLElement> = T | null

export type DirectionProperty = {
  /**
   * The document's text/writing direction.
   */
  dir?: Direction
}

export type RootProperties = {
  /**
   * @internal
   * The owner document of the machine.
   */
  doc?: Document
  /**
   * @internal
   * The root node of the machine. Useful for shadow DOM.
   */
  rootNode?: ShadowRoot
}

export type Context<T> = T &
  RootProperties & {
    /**
     * @internal
     * The unique identifier of the machine.
     */
    uid: string
    /**
     * @internal
     * The related target when the element is blurred.
     * Used as a polyfill for `e.relatedTarget`
     */
    pointerdownNode?: HTMLElement | null
  }

export type Style = JSX.CSSProperties

export * from "./prop-types"
export type { JSX }
