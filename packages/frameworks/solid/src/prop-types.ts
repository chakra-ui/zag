import type { JSX } from "solid-js"

export type PropTypes = JSX.IntrinsicElements & {
  element: JSX.HTMLAttributes<any>
}
