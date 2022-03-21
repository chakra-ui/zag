import type * as Solid from "solid-js"

type JSXElements = Solid.JSX.IntrinsicElements

export type PropTypes = {
  button: JSXElements["button"]
  label: JSXElements["label"]
  input: JSXElements["input"]
  output: JSXElements["output"]
  element: Solid.JSX.HTMLAttributes<HTMLElement & HTMLDivElement & HTMLUListElement & HTMLLIElement>
}
