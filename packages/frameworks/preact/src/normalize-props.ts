import { createNormalizer } from "@zag-js/types"
import type { CSSProperties, HTMLAttributes, JSX, SignalLike } from "preact"

// Prop getters return plain values, never signals
type Unsignal<T> = { [K in keyof T]: Exclude<T[K], SignalLike<any>> }

// Preact narrows `role` per element, so a part's role must spread onto any element.
// Distributes over unions, e.g. `input` attributes are keyed on `type`.
type Normalize<T> = T extends any
  ? Unsignal<Omit<T, "ref" | "role" | "style">> & { role?: any; style?: CSSProperties | undefined }
  : never

type ElementsWithoutRef = {
  [K in keyof JSX.IntrinsicElements]: Normalize<JSX.IntrinsicElements[K]>
}

export type PropTypes = ElementsWithoutRef & {
  element: Normalize<HTMLAttributes<HTMLElement>>
  style: CSSProperties
}

const eventMap: Record<string, string> = {
  onFocus: "onfocusin",
  onBlur: "onfocusout",
  onDoubleClick: "onDblClick",
  onChange: "onInput",
}

function toPreactProp(prop: string) {
  return prop in eventMap ? eventMap[prop] : prop
}

type Dict = Record<string, any>

export const normalizeProps = createNormalizer<PropTypes>((props: Dict) => {
  const normalized: Dict = {}
  for (const key in props) {
    normalized[toPreactProp(key)] = props[key]
  }
  return normalized
})
