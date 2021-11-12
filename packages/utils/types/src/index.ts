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

export namespace DOM {
  export type EventKeyMap = Dict<(event: R.KeyboardEvent) => void>
  export type Booleanish = boolean | "true" | "false"

  export type DataAttr<T> = T & {
    style?: Style
    "data-uid"?: string
    "data-ownedby"?: string
    "data-selected"?: Booleanish
    "data-expanded"?: Booleanish
    "data-highlighted"?: Booleanish
    "data-focus"?: Booleanish
    "data-hover"?: Booleanish
    "data-disabled"?: Booleanish
    "data-type"?: string
    "data-value"?: string | number
    "data-valuetext"?: string
    [dataAttr: string]: any
  }

  export type This = typeof globalThis

  export type Style = R.CSSProperties & {
    [prop: string]: string | number | undefined
  }
}

export namespace Props {
  export type Element = DOM.DataAttr<R.HTMLAttributes<HTMLElement>>
  export type Button = DOM.DataAttr<R.ButtonHTMLAttributes<HTMLButtonElement>>
  export type Input = DOM.DataAttr<R.InputHTMLAttributes<HTMLInputElement>>
  export type Label = DOM.DataAttr<R.LabelHTMLAttributes<HTMLLabelElement>>
  export type Output = DOM.DataAttr<R.OutputHTMLAttributes<HTMLOutputElement>>
}
