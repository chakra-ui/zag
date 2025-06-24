import type { JSX } from "./jsx"

export type RequiredBy<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>

export type Nullable<T> = T | null

export type NonNullable<T> = T extends null | undefined ? never : T

export type Required<T> = {
  [P in keyof T]-?: NonNullable<T[P]>
}

export type Direction = "ltr" | "rtl"

export type Orientation = "horizontal" | "vertical"

export type MaybeFn<T> = T | (() => T)

export type MaybeElement<T extends HTMLElement = HTMLElement> = Nullable<T>

export interface OrientationProperty {
  /**
   * The orientation of the element.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical" | undefined
}

export interface DirectionProperty {
  /**
   * The document's text/writing direction.
   * @default "ltr"
   */
  dir?: "ltr" | "rtl" | undefined
}

export interface LocaleProperties extends DirectionProperty {
  /**
   * The current locale. Based on the BCP 47 definition.
   * @default "en-US"
   */
  locale?: string | undefined
}

export interface CommonProperties {
  /**
   * The unique identifier of the machine.
   */
  id: string
  /**
   * A root node to correctly resolve document in custom environments. E.x.: Iframes, Electron.
   */
  getRootNode?: (() => ShadowRoot | Document | Node) | undefined
}

export type Style = JSX.CSSProperties

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

export type EventKeyMap<T extends HTMLElement = HTMLElement> = {
  [key in EventKey]?: (event: JSX.KeyboardEvent<T>) => void
}

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect extends Size {
  y: number
  x: number
}

export * from "./prop-types"

export * from "./create-props"

export type { JSX }
