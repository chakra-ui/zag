import type { JSX } from "./jsx"

type Dict<T = any> = Record<string, T>

type DataAttr = {
  "data-selected"?: any | undefined
  "data-expanded"?: any | undefined
  "data-highlighted"?: any | undefined
  "data-readonly"?: any | undefined
  "data-indeterminate"?: any | undefined
  "data-invalid"?: any | undefined
  "data-hover"?: any | undefined
  "data-active"?: any | undefined
  "data-focus"?: any | undefined
  "data-focus-visible"?: any | undefined
  "data-disabled"?: any | undefined
  "data-open"?: any | undefined
  "data-checked"?: any | undefined
  "data-pressed"?: any | undefined
  "data-complete"?: any | undefined
  "data-side"?: any | undefined
  "data-align"?: any | undefined
  "data-empty"?: any | undefined
  "data-placeholder-shown"?: any | undefined
  "data-half"?: any | undefined
  "data-scope"?: string | undefined
  "data-uid"?: string | undefined
  "data-name"?: string | undefined
  "data-ownedby"?: string | undefined
  "data-type"?: string | undefined
  "data-valuetext"?: string | undefined
  "data-placement"?: string | undefined
  "data-controls"?: string | undefined
  "data-part"?: string | undefined
  "data-label"?: string | undefined
  "data-state"?: string | null | undefined
  "data-value"?: string | number | undefined
  "data-orientation"?: "horizontal" | "vertical" | undefined
  "data-count"?: number | undefined
  "data-index"?: number | undefined
} & {
  [key in `data-${string}`]?: any | undefined
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
    get(_target, key: string) {
      if (key === "style")
        return (props: Dict) => {
          return fn({ style: props }).style
        }
      return fn
    },
  })
}
