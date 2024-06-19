import { createNormalizer } from "@zag-js/types"
import { isNumber, isObject, isString } from "@zag-js/utils"

const eventMap: any = {
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

function toProp(prop: string) {
  return prop in eventMap ? eventMap[prop] : prop
}

type Dict = Record<string, any>

const falsySkipList = ["hidden", "readOnly"]

export const normalizeProps = createNormalizer<any>((props: Dict) => {
  const normalized: Dict = {}

  for (const key in props) {
    let value = props[key]

    if (key === "style" && isObject(value)) {
      normalized["style"] = cssify(value)
      continue
    }

    if (falsySkipList.includes(key)) {
      value = value === false ? undefined : ""
    }

    if (key === "children") {
      if (isString(value)) {
        normalized["textContent"] = value
      }
      continue
    }

    let nextKey = toProp(key)
    if (nextKey.startsWith("on")) {
      nextKey = "@" + nextKey.slice(2).toLowerCase()
    }

    normalized[nextKey] = value
  }
  return normalized
})

function cssify(style: StyleObject): StyleObject {
  const css: any = {}
  for (const property in style) {
    const value = style[property]
    if (!isString(value) && !isNumber(value)) continue
    css[format(property)] = value
  }

  return css
}

const uppercasePattern = /[A-Z]/g
const msPattern = /^ms-/
const cache: any = {}

function toHyphenLower(match: string) {
  return "-" + match.toLowerCase()
}

function hyphenateStyleName(name: string) {
  if (cache.hasOwnProperty(name)) return cache[name]
  var hName = name.replace(uppercasePattern, toHyphenLower)
  return (cache[name] = msPattern.test(hName) ? "-" + hName : hName)
}
