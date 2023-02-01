import { createNormalizer } from "@zag-js/types"
import type * as Vue from "vue"

type ReservedProps = {
  key?: string | number | symbol
  ref?: Vue.VNodeRef
}

type Attrs<T> = T & ReservedProps

type PropTypes = JSX.IntrinsicElements & {
  element: Attrs<Vue.HTMLAttributes>
  style: Vue.CSSProperties
}

type Dict = Record<string, string>

function toCase(txt: string) {
  return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
}

const eventMap = {
  htmlFor: "for",
  className: "class",
  onDoubleClick: "onDblclick",
  onChange: "onInput",
  onFocus: "onFocusin",
  onBlur: "onFocusout",
}

function toVueProp(prop: string) {
  if (prop in eventMap) return eventMap[prop]

  if (prop.startsWith("on")) {
    return `on${toCase(prop.substr(2))}`
  }

  return prop.toLowerCase()
}

export const normalizeProps = createNormalizer<PropTypes>((props: Dict) => {
  const normalized: Dict = {}
  for (const key in props) {
    if (key === "children") {
      if (typeof props[key] === "string") {
        normalized["innerHTML"] = props[key]
      } else if (process.env.NODE_ENV !== "production") {
        console.warn("[Vue Normalize Prop] : avoid passing non-primitive value as `children`")
      }
    } else {
      normalized[toVueProp(key)] = props[key]
    }
  }
  return normalized
})
