import { createNormalizer } from "@ui-machines/types"
import { isObject, isString } from "@ui-machines/utils"
import { cssify } from "./cssify"

const eventMap = {
  onFocus: "onFocusIn",
  onBlur: "onFocusOut",
  onDoubleClick: "onDblClick",
  onChange: "onInput",
}

function toSolidProp(prop: string) {
  return prop in eventMap ? eventMap[prop] : prop
}

type Dict = Record<string, any>

export const normalizeProps = createNormalizer((props: Dict) => {
  const normalized: Dict = {}

  for (const key in props) {
    const value = props[key]

    if (key === "style" && isObject(value)) {
      normalized["style"] = cssify(value)
      continue
    }

    if (key === "children") {
      if (isString(value)) {
        normalized["textContent"] = value
      }
      continue
    }

    normalized[toSolidProp(key)] = value
  }
  return normalized
})
