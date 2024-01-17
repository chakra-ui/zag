import { createNormalizer } from "@zag-js/types"

type Dict = Record<string, boolean | number | string | undefined>

const propMap: Record<string, string> = {
  className: "class",
  defaultChecked: "checked",
  defaultValue: "value",
  htmlFor: "for",
  onBlur: "onfocusout",
  onChange: "oninput",
  onFocus: "onfocusin",
}

function toSvelteProp(key: string) {
  if (key in propMap) return propMap[key]
  return key.toLowerCase()
}

function toSveltePropValue(value: Dict[string]) {
  return value === false ? undefined : value
}

export const normalizeProps = createNormalizer((props) => {
  const normalized: Dict = {}

  for (const key in props) {
    normalized[toSvelteProp(key)] = toSveltePropValue(props[key])
  }

  return normalized
})
