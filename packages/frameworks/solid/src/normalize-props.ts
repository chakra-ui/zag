import { createNormalizer } from "@zag-js/types"
import { isNumber, isObject, isString } from "@zag-js/utils"
import type { JSX } from "solid-js"

export type PropTypes = JSX.IntrinsicElements & {
  element: JSX.HTMLAttributes<any>
  style: JSX.CSSProperties
}

const eventMap: Record<string, string> = {
  onFocus: "onFocusIn",
  onBlur: "onFocusOut",
  onDoubleClick: "onDblClick",
  onChange: "onInput",
  defaultChecked: "checked",
  defaultValue: "value",
  htmlFor: "for",
  className: "class",
}

const format = (v: string) => (v.startsWith("--") ? v : hyphenateStyleName(v))

type StyleObject = Record<string, any>

function toSolidProp(prop: string) {
  return prop in eventMap ? eventMap[prop] : prop
}

type Dict = Record<string, any>

export const normalizeProps = createNormalizer<PropTypes>((props: Dict) => {
  const normalized: Dict = {}

  for (const key in props) {
    const value = props[key]

    if (key === "readOnly" && value === false) {
      continue
    }

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

function cssify(style: StyleObject): StyleObject {
  let css = {} as StyleObject
  for (const property in style) {
    const value = style[property]
    if (!isString(value) && !isNumber(value)) continue
    css[format(property)] = value
  }

  return css
}

const uppercasePattern = /[A-Z]/g
const msPattern = /^ms-/

function toHyphenLower(match: string) {
  return "-" + match.toLowerCase()
}

const cache: Record<string, any> = {}

function hyphenateStyleName(name: string) {
  if (cache.hasOwnProperty(name)) return cache[name]
  const hName = name.replace(uppercasePattern, toHyphenLower)
  return (cache[name] = msPattern.test(hName) ? "-" + hName : hName)
}
