import { createNormalizer } from "@zag-js/types"
import { isObject, isString } from "@zag-js/utils"
import { cssify } from "./cssify"
import type { JSX } from "solid-js"

type PropTypes = {
  button: JSX.IntrinsicElements["button"]
  label: JSX.IntrinsicElements["label"]
  input: JSX.IntrinsicElements["input"]
  output: JSX.IntrinsicElements["output"]
  element: JSX.HTMLAttributes<any>
}

const eventMap = {
  onFocus: "onFocusIn",
  onBlur: "onFocusOut",
  onDoubleClick: "onDblClick",
  onChange: "onInput",
  defaultChecked: "checked",
  defaultValue: "value",
  htmlFor: "for",
  className: "class",
}

function toSolidProp(prop: string) {
  return prop in eventMap ? eventMap[prop] : prop
}

type Dict = Record<string, any>

export const normalizeProps = createNormalizer<PropTypes>((props: Dict) => {
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
