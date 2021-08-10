import { is, warn } from "@core-foundation/utils"
import { PropNormalizer } from "@ui-machines/core"

type Dict = Record<string, string>

function toCase(txt: string) {
  return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
}

const eventMap = {
  onFocus: "onFocusin",
  onBlur: "onFocusout",
  className: "class",
  onDoubleClick: "onDblclick",
  onChange: "onInput",
}

function toVueProp(prop: string) {
  if (prop in eventMap) return eventMap[prop]

  if (prop.startsWith("on")) {
    const [value] = prop.split("on").filter(Boolean)
    return `on${toCase(value)}`
  }

  return prop.toLowerCase()
}

export const normalizeProps: PropNormalizer = (props: Dict) => {
  const normalized: Dict = {}
  for (const key in props) {
    if (key === "children") {
      if (is.string(props[key])) {
        normalized["innerHTML"] = props[key]
      } else {
        warn("[Vue Normalize Prop] : avoid passing non-primitive value as `children`")
      }
    } else {
      normalized[toVueProp[key]] = props[key]
    }
  }
  return normalized
}
