import type { JSX } from "./jsx"

type Dict<T = any> = Record<string, T>

type Booleanish = boolean | "true" | "false"

type DataAttr = {
  [key in `data-${string}`]?: string | number | Booleanish
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
