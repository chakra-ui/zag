import type * as React from "react"

type Dict<T = any> = Record<string, T>

type Booleanish = boolean | "true" | "false"

type Omit<T, K extends keyof T> = { [P in Exclude<keyof T, K>]?: T[P] }

type WithStyle<T extends { style?: any }> = Omit<T, "style"> & {
  style?: T["style"] & {
    [prop: string]: string | number | undefined
  }
}

type DataAttr = {
  "data-uid"?: string
  "data-ownedby"?: string
  "data-selected"?: Booleanish
  "data-expanded"?: Booleanish
  "data-highlighted"?: Booleanish
  "data-readonly"?: Booleanish
  "data-invalid"?: Booleanish
  "data-hover"?: Booleanish
  "data-active"?: Booleanish
  "data-focus"?: Booleanish
  "data-disabled"?: Booleanish
  "data-type"?: string
  "data-value"?: string | number
  "data-valuetext"?: string
  "data-open"?: Booleanish
  "data-placement"?: string
  "data-orientation"?: "horizontal" | "vertical"
  "data-label"?: string
  "data-focused"?: Booleanish
  "data-checked"?: Booleanish
  "data-state"?: string | null
  "data-half"?: Booleanish
  "data-count"?: number
  "data-controls"?: string
}

type JSXElementAttributes = DataAttr & React.HTMLAttributes<HTMLElement>
type JSXButtonAttributes = DataAttr & React.ButtonHTMLAttributes<HTMLButtonElement>
type JSXInputAttributes = DataAttr & React.InputHTMLAttributes<HTMLInputElement>
type JSXLabelAttributes = DataAttr & React.LabelHTMLAttributes<HTMLLabelElement>
type JSXOutputAttributes = DataAttr & React.OutputHTMLAttributes<HTMLOutputElement>

export type PropTypes = Record<"button" | "label" | "input" | "output" | "element", Dict>

export type ReactPropTypes = {
  button: JSXButtonAttributes
  label: JSXLabelAttributes
  input: JSXInputAttributes
  output: JSXOutputAttributes
  element: JSXElementAttributes
}

export type NormalizeProps = {
  button<T extends PropTypes>(props: WithStyle<JSXButtonAttributes>): T["button"]
  label<T extends PropTypes>(props: WithStyle<JSXLabelAttributes>): T["label"]
  input<T extends PropTypes>(props: WithStyle<JSXInputAttributes>): T["input"]
  output<T extends PropTypes>(props: WithStyle<JSXOutputAttributes>): T["output"]
  element<T extends PropTypes>(props: WithStyle<JSXElementAttributes>): T["element"]
}

export function createNormalizer(fn: (props: Dict) => Dict): NormalizeProps {
  return { button: fn, label: fn, input: fn, output: fn, element: fn }
}

export const normalizeProp = createNormalizer((v) => v)
