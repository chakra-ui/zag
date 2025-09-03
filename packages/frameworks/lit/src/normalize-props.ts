import { createNormalizer } from "@zag-js/types"
import { isObject } from "@zag-js/utils"

// Lit uses built-in template binding syntax for prop normalization:
// - 'attribute-name': value -> attribute
// - '?boolean-attr': true -> boolean attribute
// - '@event-name': handler -> event listener
// - '.property': value -> property assignment

type LitElementProps = {
  [key: string]: any
  style?: string | Record<string, any>
}

type RequiredElements =
  | "button"
  | "label"
  | "input"
  | "textarea"
  | "img"
  | "output"
  | "select"
  | "rect"
  | "circle"
  | "svg"
  | "path"

export type PropTypes = Record<RequiredElements, LitElementProps> & {
  element: LitElementProps
  style: Record<string, any>
}

const propMap: Record<string, string> = {
  onFocus: "onfocusin",
  onBlur: "onfocusout",
  onDoubleClick: "ondblclick",
  onChange: "oninput",
  defaultChecked: "checked",
  defaultValue: "value",
  defaultSelected: "selected",
  htmlFor: "for",
  className: "class",
}

// Properties that should be set as properties, not attributes
const propertyNames = new Set([
  "value",
  "checked",
  "selected",
  "disabled",
  "readonly",
  "multiple",
  "hidden",
  "contenteditable",
  "draggable",
  "spellcheck",
  "autocomplete",
])

const svgAttributes = new Set<string>(
  "viewBox,preserveAspectRatio,fillRule,clipPath,clipRule,strokeWidth,strokeLinecap,strokeLinejoin,strokeDasharray,strokeDashoffset,strokeMiterlimit".split(
    ",",
  ),
)

const shouldPreserveCase = (key: string): boolean => {
  return (
    key.startsWith("data-") ||
    key.startsWith("aria-") ||
    key.includes(":") || // XML namespaced
    key.startsWith("xml") || // XML attributes
    svgAttributes.has(key)
  )
}

export function toStyleString(style: Record<string, number | string>): string {
  let string = ""

  for (let key in style) {
    /**
     * Ignore null and undefined values.
     */
    const value = style[key]
    if (value === null || value === undefined) continue

    /**
     * Convert camelCase to kebab-case except for CSS custom properties.
     */
    if (!key.startsWith("--")) {
      key = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    }

    string += `${key}:${value};`
  }

  return string
}

type Dict = Record<string, any>

export const normalizeProps = createNormalizer<PropTypes>((props: Dict) => {
  const normalized: Dict = {}

  for (let key in props) {
    const value = props[key]

    // Skip undefined values
    if (value === undefined) {
      continue
    }

    // Handle style objects
    if (key === "style" && isObject(value)) {
      normalized["style"] = toStyleString(value)
      continue
    }

    // Map React-style prop names
    if (key in propMap) {
      key = propMap[key]
    }

    // Convert to Lit event listener syntax: @eventname
    if (key.startsWith("on") && typeof value === "function") {
      normalized[`@${key.toLowerCase().slice(2)}`] = value
      continue
    }

    // Handle boolean attributes with ? prefix
    if (typeof value === "boolean") {
      normalized[`?${key.toLowerCase()}`] = value
      continue
    }

    // Handle properties that should be set as properties with . prefix
    if (propertyNames.has(key.toLowerCase())) {
      normalized[`.${key.toLowerCase()}`] = value
      continue
    }

    // Everything else as attribute
    const attrKey = shouldPreserveCase(key) ? key : key.toLowerCase()
    normalized[attrKey] = value
  }

  return normalized
})
