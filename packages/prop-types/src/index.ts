import type * as React from "react"

type Booleanish = boolean | "true" | "false"

type Dict = Record<string, any>

type DataAttr = {
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
  button<T extends PropTypes>(props: JSXButtonAttributes): T["button"]
  label<T extends PropTypes>(props: JSXLabelAttributes): T["label"]
  input<T extends PropTypes>(props: JSXInputAttributes): T["input"]
  output<T extends PropTypes>(props: JSXOutputAttributes): T["output"]
  element<T extends PropTypes>(props: JSXElementAttributes): T["element"]
}

export function createNormalizer(fn: (props: Dict) => Dict): NormalizeProps {
  return { button: fn, label: fn, input: fn, output: fn, element: fn }
}

export const normalizeProp = createNormalizer((v) => v)
