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
  onDoubleClick: "ondblclick",
}

function toStyleString(style: Record<string, number | string>) {
  let string = ""

  for (let key in style) {
    /**
     * Ignore null and undefined values.
     */
    const value = style[key]
    if (value === null || value === undefined) continue

    /**
     * Convert camelCase to kebab-case except for CSS custom properties.
     */
    if (!key.startsWith("--")) key = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)

    string += `${key}:${value};`
  }

  return string
}

function toSvelteProp(key: string) {
  if (key in propMap) return propMap[key]
  return key.toLowerCase()
}

function toSveltePropValue(key: string, value: Dict[string]) {
  if (key === "style" && typeof value === "object") return toStyleString(value)
  if (value === false) return

  return value
}

export const normalizeProps = createNormalizer((props) => {
  const normalized: Dict = {}

  for (const key in props) {
    normalized[toSvelteProp(key)] = toSveltePropValue(key, props[key])
  }

  return normalized
})
