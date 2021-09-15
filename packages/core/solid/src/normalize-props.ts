import { is } from "@core-foundation/utils"
import { cssify } from "./cssify"

export interface PropNormalizer {
  <T extends Dict = Dict>(props: T): Dict
}

type Dict = Record<string, any>

const eventMap = {
  onFocus: "onFocusIn",
  onBlur: "onFocusOut",
  onDoubleClick: "onDblClick",
  onChange: "onInput",
}

function toSolidProp(prop: string) {
  return prop in eventMap ? eventMap[prop] : prop
}

export const normalizeProps: PropNormalizer = (props: Dict) => {
  const normalized: Dict = {}

  for (const key in props) {
    const value = props[key]

    if (key === "style" && is.object(value)) {
      normalized["style"] = cssify(value)
      continue
    }

    if (key === "children") {
      if (is.string(value)) {
        normalized["textContent"] = value
      }
      continue
    }

    normalized[toSolidProp(key)] = value
  }
  return normalized
}
