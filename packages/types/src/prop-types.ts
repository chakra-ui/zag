import type { HTMLAttributes } from "react"

type Dict<T = any> = Record<string, T>

type Booleanish = boolean | "true" | "false"

type Omit<T, K extends keyof T> = { [P in Exclude<keyof T, K>]?: T[P] }

type WithStyle<T extends { style?: any }> = Omit<T, "style"> & {
  style?: T["style"] & {
    [prop: string]: string | number | undefined
  }
}

type WithDataset<T> = T & {
  "data-uid"?: string
  "data-name"?: string
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
  "data-checked"?: Booleanish
  "data-pressed"?: Booleanish
  "data-state"?: string | null
  "data-half"?: Booleanish
  "data-count"?: number
  "data-controls"?: string
  "data-part"?: string
  "data-index"?: number
  "data-complete"?: Booleanish
  "data-empty"?: Booleanish
  "data-placeholder-shown"?: Booleanish
}

type MergeProps<T> = WithDataset<WithStyle<T>>

type GenericElement = {
  element<T extends PropTypes>(props: MergeProps<JSX.IntrinsicElements["div"]>): T["element"]
}

type GenericAttributes = {
  element: HTMLAttributes<HTMLElement>
}

type Types = "template" | "webview" | "feDropShadow" | "mpath"

export type PropTypes = {
  [K in Exclude<keyof JSX.IntrinsicElements, Types>]: Dict
} & {
  element: Dict
}

export type ReactPropTypes = GenericAttributes & JSX.IntrinsicElements

export type NormalizeProps = GenericElement & {
  [K in keyof JSX.IntrinsicElements]: <T extends PropTypes>(props: MergeProps<JSX.IntrinsicElements[K]>) => T[K]
}

export function createNormalizer(fn: (props: Dict) => Dict): NormalizeProps {
  return new Proxy({} as any, {
    get() {
      return fn
    },
  })
}

export const normalizeProp = createNormalizer((v) => v)
