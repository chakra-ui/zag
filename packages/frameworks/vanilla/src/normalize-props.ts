import { createNormalizer } from "@zag-js/types"

export interface AttrMap {
  [key: string]: string
}

export const propMap: AttrMap = {
  onFocus: "onFocusin",
  onBlur: "onFocusout",
  onChange: "onInput",
  onDoubleClick: "onDblclick",
  htmlFor: "for",
  className: "class",
  defaultValue: "value",
  defaultChecked: "checked",
}

// SVG attributes that should preserve their case
const caseSensitiveSvgAttrs = new Set<string>(["viewBox", "preserveAspectRatio"])

const toStyleString = (style: any) => {
  let string = ""
  for (let key in style) {
    const value = style[key]
    if (value === null || value === undefined) continue
    if (!key.startsWith("--")) key = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    string += `${key}:${value};`
  }
  return string
}

export const normalizeProps = createNormalizer((props: any) => {
  return Object.entries(props).reduce<any>((acc, [key, value]) => {
    if (value === undefined) return acc

    if (key in propMap) {
      key = propMap[key]
    }

    if (key === "style" && typeof value === "object") {
      acc.style = toStyleString(value)
      return acc
    }

    // Preserve case for SVG attributes, lowercase everything else
    const normalizedKey = caseSensitiveSvgAttrs.has(key) ? key : key.toLowerCase()
    acc[normalizedKey] = value

    return acc
  }, {})
})
