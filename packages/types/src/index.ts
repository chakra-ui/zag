import type { JSX } from "./jsx"

export type RequiredBy<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>

export type NonNullable<T> = T extends null | undefined ? never : T

export type Required<T> = {
  [P in keyof T]-?: NonNullable<T[P]>
}

export type Direction = "ltr" | "rtl"

export type Orientation = "horizontal" | "vertical"

export type MaybeElement<T extends HTMLElement = HTMLElement> = T | null

export interface OrientationProperty {
  /**
   * The orientation of the element.
   * @default "horizontal"
   */
  orientation?: Orientation | undefined
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

export * from "./prop-types"
export type { JSX }
export * from "./create-props"
