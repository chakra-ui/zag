import type { JSX } from "solid-js"

type JSXElements = JSX.IntrinsicElements

export type PropTypes = {
  button: JSXElements["button"]
  label: JSXElements["label"]
  input: JSXElements["input"]
  output: JSXElements["output"]
  element: JSX.HTMLAttributes<any>
}
