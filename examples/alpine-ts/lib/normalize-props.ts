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

function toAlpineProp(prop: string) {
  if (prop === "children") return "x-html"
  return (propMap[prop] ?? prop).toLowerCase()
}

export const normalizeProps = createNormalizer((props) => {
  return Object.entries(props).reduce<any>((acc, [key, value]) => {
    acc[toAlpineProp(key)] = value
    return acc
  }, {})
})
