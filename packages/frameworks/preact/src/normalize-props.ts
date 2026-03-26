import { createNormalizer } from "@zag-js/types"
import type { JSX, DOMAttributes, CSSProperties } from "preact"

type WithoutRef<T> = Omit<T, "ref">

type ElementsWithoutRef = {
  [K in keyof JSX.IntrinsicElements]: WithoutRef<JSX.IntrinsicElements[K]>
}

export type PropTypes = ElementsWithoutRef & {
  element: WithoutRef<DOMAttributes<HTMLElement>>
  style: CSSProperties
}

const eventMap: Record<string, string> = {
  onFocus: "onfocusin",
  onBlur: "onfocusout",
  onDoubleClick: "onDblClick",
  onChange: "onInput",
  defaultChecked: "checked",
  defaultValue: "value",
}

function toPreactProp(prop: string) {
  return prop in eventMap ? eventMap[prop] : prop
}

type Dict = Record<string, any>

function toPascalCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
}

function appendPartClassName(props: Dict) {
  const part = props["data-part"]
  const scope = props["data-scope"]
  if (typeof part !== "string" || part.length === 0 || typeof scope !== "string" || scope.length === 0) return

  const scopedPartClassName = `${toPascalCase(scope)}${toPascalCase(part)}`
  const existing = typeof props["className"] === "string" ? props["className"] : typeof props["class"] === "string" ? props["class"] : ""

  const next = [existing, scopedPartClassName].filter(Boolean).join(" ")
  if (next) {
    props["className"] = next
    props["class"] = next
  }
}

export const normalizeProps = createNormalizer<PropTypes>((props: Dict) => {
  appendPartClassName(props)
  const normalized: Dict = {}
  for (const key in props) {
    normalized[toPreactProp(key)] = props[key]
  }
  return normalized
})
