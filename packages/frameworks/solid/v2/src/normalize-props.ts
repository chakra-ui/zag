import type { JSX } from "@solidjs/web"
import { createNormalizer } from "@zag-js/types"
import { isBoolean, isNumber, isObject, isString } from "@zag-js/utils"

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

// Solid 2 removes an attribute set to `false` and renders `true` as an empty string.
// These attributes take "true" / "false" as values, so they must be stringified.
const booleanishAttrs = new Set(["contentEditable", "draggable", "spellCheck"])

function isBooleanishAttr(key: string) {
  return key.startsWith("aria-") || key.startsWith("data-") || booleanishAttrs.has(key)
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

    if (isBoolean(value) && isBooleanishAttr(key)) {
      normalized[key] = String(value)
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
