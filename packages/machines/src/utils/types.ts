import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent,
  LabelHTMLAttributes,
  OutputHTMLAttributes,
} from "react"

export type Dict<T = any> = Record<string, T>

export namespace DOM {
  export type EventKeyMap = Dict<(event: KeyboardEvent) => void>
  export type Booleanish = boolean | "true" | "false"
  export type Direction = "ltr" | "rtl"

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

  export type Context<T> = T & {
    uid: string
    doc?: Document
    pointerdownNode?: HTMLElement | null
    dir?: Direction
  }

  export type This = typeof globalThis

  export type Style = CSSProperties & {
    [prop: string]: string | number | undefined
  }
}

export namespace Props {
  export type Element = DOM.DataAttr<HTMLAttributes<HTMLElement>>
  export type Button = DOM.DataAttr<ButtonHTMLAttributes<HTMLButtonElement>>
  export type Input = DOM.DataAttr<InputHTMLAttributes<HTMLInputElement>>
  export type Label = DOM.DataAttr<LabelHTMLAttributes<HTMLLabelElement>>
  export type Output = DOM.DataAttr<OutputHTMLAttributes<HTMLOutputElement>>
}
