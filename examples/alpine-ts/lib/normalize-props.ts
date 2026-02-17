import { createNormalizer } from "@zag-js/types"

const propMap: Record<string, string> = {
  htmlFor: "for",
  className: "class",
  onDoubleClick: "onDblclick",
  onChange: "onInput",
  onFocus: "onFocusin",
  onBlur: "onFocusout",
  defaultValue: "value",
  defaultChecked: "checked",
}

export const normalizeProps = createNormalizer((props) => {
  const normalized: Record<string, () => any> = {}
  for (const key in props) {
    const prop = key in propMap ? propMap[key] : key
    const value = props[key]

    if (prop === "children") {
      normalized["x-html"] = () => value
    } else if (prop.startsWith("on")) {
      normalized["@" + prop.substring(2).toLowerCase()] = value
    } else {
      normalized[":" + prop.toLowerCase()] = () => value
    }
  }
  return normalized
})
