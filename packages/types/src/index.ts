import type { JSX } from "./jsx"

export type RequiredBy<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>

export type Direction = "ltr" | "rtl"

export type Orientation = "horizontal" | "vertical"

export type MaybeElement<T extends HTMLElement = HTMLElement> = T | null

export interface OrientationProperty {
  /**
   * The orientation of the element.
   * @default "horizontal"
   */
  orientation?: Orientation
}

export interface DirectionProperty {
  /**
   * The document's text/writing direction.
   * @default "ltr"
   */
  dir?: "ltr" | "rtl"
}

export interface LocaleProperties extends DirectionProperty {
  /**
   * The current locale. Based on the BCP 47 definition.
   * @default "en-US"
   */
  locale?: string
}

export interface CommonProperties {
  /**
   * The unique identifier of the machine.
   */
  id: string
  /**
   * A root node to correctly resolve document in custom environments. E.x.: Iframes, Electron.
   */
  getRootNode?: () => ShadowRoot | Document | Node
}

export interface RootProperties {
  /**
   * The owner document of the machine.
   */
  doc?: Document
  /**
   * The root node of the machine. Useful for shadow DOM.
   */
  rootNode?: ShadowRoot
  /**
   * The related target when the element is blurred.
   * Used as a polyfill for `e.relatedTarget`
   */
  pointerdownNode?: HTMLElement | null
}

export type Context<T> = T & RootProperties

export type Style = JSX.CSSProperties

export * from "./prop-types"
export type { JSX }
