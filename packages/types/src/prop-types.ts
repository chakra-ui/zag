import type { JSX } from "./jsx"

type Dict<T = any> = Record<string, T>

type Booleanish = boolean | "true" | "false"

type DataAttr = {
  "data-selected"?: Booleanish
  "data-expanded"?: Booleanish
  "data-highlighted"?: Booleanish
  "data-readonly"?: Booleanish
  "data-indeterminate"?: Booleanish
  "data-invalid"?: Booleanish
  "data-hover"?: Booleanish
  "data-active"?: Booleanish
  "data-focus"?: Booleanish
  "data-disabled"?: Booleanish
  "data-open"?: Booleanish
  "data-checked"?: Booleanish
  "data-pressed"?: Booleanish
  "data-complete"?: Booleanish
  "data-empty"?: Booleanish
  "data-placeholder-shown"?: Booleanish
  "data-half"?: Booleanish
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
  [key in `data-${string}`]?: string | number | Booleanish
}

export type PropTypes<T = Dict> = Record<
  "button" | "label" | "input" | "img" | "output" | "element" | "select" | "style",
  T
>

export type NormalizeProps<T extends PropTypes> = {
  [K in keyof T]: (props: K extends keyof JSX.IntrinsicElements ? DataAttr & JSX.IntrinsicElements[K] : never) => T[K]
} & {
  element(props: DataAttr & JSX.HTMLAttributes<HTMLElement>): T["element"]
  style: JSX.CSSProperties
}
export function createNormalizer<T extends PropTypes>(fn: (props: Dict) => Dict): NormalizeProps<T> {
  return new Proxy({} as any, {
    get() {
      return fn
    },
  })
}
