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

export const normalizeProps = createNormalizer((props) => {
  return Object.entries(props).reduce<any>((acc, [key, value]) => {
    // if (value === undefined) return acc

    key = propMap[key] ?? key

    if (key === "children") {
      acc["x-html"] = () => value
    } else if (key.startsWith("on")) {
      acc["@" + key.substring(2).toLowerCase()] = value
    } else {
      acc[":" + key.toLowerCase()] = () => value
    }

    return acc
  }, {})
})
