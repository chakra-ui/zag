import type { CSSProperties, HTMLAttributes, IntrinsicElements } from "@builder.io/qwik"
import { createNormalizer } from "@zag-js/types"

export type PropTypes = IntrinsicElements & {
  element: HTMLAttributes<any>
  style: CSSProperties
}

const propMap: Record<string, string> = {
  htmlFor: "for",
  className: "class",
  onDoubleClick: "onDblClick$",
  onChange: "onInput$",
  onFocus: "onFocus$",
  onBlur: "onBlur$",
  defaultValue: "value",
  defaultChecked: "checked",
}

function toQwikProp(prop: string) {
  if (prop in propMap) return propMap[prop]

  if (prop.startsWith("on")) {
    return prop + "$"
  }

  return prop
}

type Dict = Record<string, any>

export const normalizeProps = createNormalizer<PropTypes>((props) => {
  const normalized: Dict = {}

  for (const key in props) {
    normalized[toQwikProp(key)] = props[key]
  }

  return normalized
})
