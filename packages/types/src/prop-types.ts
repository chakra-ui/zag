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

type SveltePropTypes = PropTypes & {
  isSvelte: boolean
}

export type PropTypes = Record<"button" | "label" | "input" | "output" | "element" | "select" | "style", Dict>

type NormalizeSvelteProps<T extends PropTypes> = {
  [K in keyof Omit<NormalizeProps<T>, "isSvelte">]: NormalizeProps<T>[K] extends (...args: infer Args) => infer Ret
    ? (...args: Args) => {
        handlers: Ret
        attributes: Ret
      }
    : NormalizeProps<T>[K]
}

export type NormalizeProps<T extends PropTypes> = {
  [K in keyof T]: (props: K extends keyof JSX.IntrinsicElements ? DataAttr & JSX.IntrinsicElements[K] : never) => T[K]
} & {
  element(props: DataAttr & JSX.HTMLAttributes<HTMLElement>): T["element"]
  style: JSX.CSSProperties
}

export function createNormalizer<T extends SveltePropTypes>(fn: (props: Dict) => Dict): NormalizeSvelteProps<T>
export function createNormalizer<T extends PropTypes>(fn: (props: Dict) => Dict): NormalizeProps<T>
export function createNormalizer(fn: (props: Dict) => Dict): Record<string, any> {
  return new Proxy({} as any, {
    get() {
      return fn
    },
  })
}
