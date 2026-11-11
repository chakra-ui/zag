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
export const caseSensitiveSvgAttrs = new Set<string>(["viewBox", "preserveAspectRatio"])

// Kept for callers that render props into an HTML string rather than through `spreadProps`
export const toStyleString = (style: any) => {
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
  const result: any = {}
  for (const prop in props) {
    const value = props[prop]
    if (value === undefined) continue
    const key = propMap[prop] ?? prop
    // Preserve case for SVG attributes, lowercase everything else
    result[caseSensitiveSvgAttrs.has(key) ? key : key.toLowerCase()] = value
  }
  return result
})
