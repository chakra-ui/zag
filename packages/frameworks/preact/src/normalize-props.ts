import { createNormalizer } from "@zag-js/types"
import type { JSX } from "preact"

type WithoutRef<T> = Omit<T, "ref">

type ElementsWithoutRef = {
  [K in keyof JSX.IntrinsicElements]: WithoutRef<JSX.IntrinsicElements[K]>
}

export type PropTypes = ElementsWithoutRef & {
  element: WithoutRef<JSX.DOMAttributes<HTMLElement>>
  style: JSX.CSSProperties
}

const eventMap = {
  onFocus: "onfocusin",
  onBlur: "onfocusout",
  onDoubleClick: "onDblClick",
  onChange: "onInput",
  defaultChecked: "checked",
  defaultValue: "value",
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
