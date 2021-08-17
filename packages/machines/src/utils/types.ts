import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent,
  LabelHTMLAttributes,
} from "react"

export type Dict<T = any> = Record<string, T>

export type Booleanish = boolean | "true" | "false"

export type WithDataAttr<T> = T & {
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
  [dataAttr: string]: any
}

export type WithDOM<T> = T & {
  uid: string
  doc?: Document
  pointerdownNode?: HTMLElement | null
  direction?: "ltr" | "rtl"
}

export type EventKeyMap = Dict<(event: KeyboardEvent) => void>

type Style = {
  style?: CSSProperties & {
    [customProperty: string]: string | number | undefined
  }
}

export type HTMLProps = WithDataAttr<HTMLAttributes<HTMLElement> & Style>
export type ButtonProps = WithDataAttr<ButtonHTMLAttributes<HTMLButtonElement> & Style>
export type InputProps = WithDataAttr<InputHTMLAttributes<HTMLInputElement> & Style>
export type LabelProps = WithDataAttr<LabelHTMLAttributes<HTMLLabelElement> & Style>
