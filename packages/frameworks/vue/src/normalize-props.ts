import { createNormalizer } from "@zag-js/types"
import type * as Vue from "vue"

type ReservedProps = {
  key?: string | number | symbol | undefined
  ref?: Vue.VNodeRef | undefined
}

type Attrs<T> = T & ReservedProps

export type PropTypes = Vue.NativeElements & {
  element: Attrs<Vue.HTMLAttributes>
  style: Vue.CSSProperties
}

type Dict = Record<string, string>

function toCase(txt: string) {
  return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
}

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

const preserveKeys =
  "viewBox,className,preserveAspectRatio,fillRule,clipPath,clipRule,strokeWidth,strokeLinecap,strokeLinejoin,strokeDasharray,strokeDashoffset,strokeMiterlimit".split(
    ",",
  )

function toVueProp(prop: string) {
  if (prop in propMap) return propMap[prop]
  if (prop.startsWith("on")) return `on${toCase(prop.substr(2))}`
  if (preserveKeys.includes(prop)) return prop
  return prop.toLowerCase()
}

export const normalizeProps = createNormalizer<PropTypes>((props: Dict) => {
  const normalized: Dict = {}
  for (const key in props) {
    const value = props[key]
    if (key === "children") {
      if (typeof value === "string") {
        normalized["innerHTML"] = value
      } else if (process.env.NODE_ENV !== "production" && value != null) {
        console.warn("[Vue Normalize Prop] : avoid passing non-primitive value as `children`")
      }
    } else {
      normalized[toVueProp(key)] = props[key]
    }
  }
  return normalized
})
