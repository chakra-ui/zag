import { createNormalizer } from "@zag-js/types"

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

// Map React-style event names to DOM event names
const eventMap: Record<string, string> = {
  onFocus: "onfocusin",
  onBlur: "onfocusout",
  onChange: "oninput",
  onDoubleClick: "ondblclick",
}

// Map React-style prop names to HTML attribute names
const propMap: Record<string, string> = {
  className: "class",
  htmlFor: "for",
}

// Properties that should be set as properties, not attributes
const propertyNames = new Set([
  "value",
  "checked",
  "selected",
  "defaultValue",
  "defaultChecked",
  "defaultSelected",
  "disabled",
  "readOnly",
  "multiple",
  "hidden",
  "contentEditable",
  "draggable",
  "spellcheck",
  "autocomplete",
])

const toStyleString = (style: Record<string, any>): string => {
  let styleString = ""
  for (const [key, value] of Object.entries(style)) {
    if (value == null) continue

    // Convert camelCase to kebab-case for CSS properties (except CSS custom properties)
    const cssKey = key.startsWith("--") ? key : key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)

    styleString += `${cssKey}:${value};`
  }
  return styleString
}

type Dict = Record<string, any>

export const normalizeProps = createNormalizer<PropTypes>((props: Dict) => {
  const normalized: Dict = {}

  for (let [key, value] of Object.entries(props)) {
    // Skip undefined values
    if (value === undefined) {
      continue
    }

    // Handle style objects
    if (key === "style" && typeof value === "object" && value !== null) {
      normalized.style = toStyleString(value)
      continue
    }

    // Map React-style prop names
    if (key in propMap) {
      key = propMap[key]
    }

    // Handle event handlers
    if (key.startsWith("on") && typeof value === "function") {
      // Map React-style event names to DOM events
      const mappedEvent = eventMap[key]
      if (mappedEvent) {
        key = mappedEvent
      }

      // Convert to Lit event listener syntax: @eventname
      const eventName = key.slice(2).toLowerCase()
      normalized[`@${eventName}`] = value
      continue
    }

    // Handle boolean attributes with ? prefix
    if (typeof value === "boolean") {
      normalized[`?${key}`] = value
      continue
    }

    // Handle properties that should be set as properties with . prefix
    if (propertyNames.has(key)) {
      normalized[`.${key}`] = value
      continue
    }

    // Everything else as attribute (preserve original case for data-* and aria-* attributes)
    normalized[key] = value
  }

  return normalized
})
