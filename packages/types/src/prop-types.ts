import type { JSX } from "./jsx"

type Dict<T = any> = Record<string, T>

type DataAttr = {
  "data-selected"?: any
  "data-expanded"?: any
  "data-highlighted"?: any
  "data-readonly"?: any
  "data-indeterminate"?: any
  "data-invalid"?: any
  "data-hover"?: any
  "data-active"?: any
  "data-focus"?: any
  "data-disabled"?: any
  "data-open"?: any
  "data-checked"?: any
  "data-pressed"?: any
  "data-complete"?: any
  "data-side"?: any
  "data-align"?: any
  "data-empty"?: any
  "data-placeholder-shown"?: any
  "data-half"?: any
  "data-scope"?: string
  "data-uid"?: string
  "data-name"?: string
  "data-ownedby"?: string
  "data-type"?: string
  "data-valuetext"?: string
  "data-placement"?: string
  "data-controls"?: string
  "data-part"?: string
  "data-label"?: string
  "data-state"?: string | null
  "data-value"?: string | number
  "data-orientation"?: "horizontal" | "vertical"
  "data-count"?: number
  "data-index"?: number
} & {
  [key in `data-${string}`]?: any
}

export type PropTypes<T = Dict> = Record<
  | "button"
  | "label"
  | "input"
  | "textarea"
  | "img"
  | "output"
  | "element"
  | "select"
  | "rect"
  | "style"
  | "circle"
  | "svg"
  | "path",
  T
>

export type NormalizeProps<T extends PropTypes> = {
  [K in keyof T]: (props: K extends keyof JSX.IntrinsicElements ? DataAttr & JSX.IntrinsicElements[K] : never) => T[K]
} & {
  element(props: DataAttr & JSX.HTMLAttributes<HTMLElement> & Record<string, any>): T["element"]
  style: JSX.CSSProperties
}

export function createNormalizer<T extends PropTypes>(fn: (props: Dict) => Dict): NormalizeProps<T> {
  return new Proxy({} as any, {
    get() {
      return fn
    },
  })
}
