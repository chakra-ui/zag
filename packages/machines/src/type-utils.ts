import { Booleanish, Dict } from "@chakra-ui/utilities/type-utils"
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent,
} from "react"

export type WithDataAttr<T> = T & {
  "data-uid"?: string
  "data-ownedby"?: string
  "data-selected"?: Booleanish
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

export type DOMHTMLProps = HTMLAttributes<HTMLElement> & Style

export type DOMButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Style

export type DOMInputProps = InputHTMLAttributes<HTMLInputElement> & Style
