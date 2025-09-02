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

type Dict = Record<string, any>

export const normalizeProps = createNormalizer<PropTypes>((props: Dict) => {
  const normalized: Dict = {}

  for (const key in props) {
    const value = props[key]

    // Skip undefined values
    if (value === undefined) {
      continue
    }

    // Handle event handlers - prefix with @
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase()
      normalized[`@${eventName}`] = value
      continue
    }

    // Handle boolean attributes - prefix with ?
    if (typeof value === "boolean") {
      normalized[`?${key}`] = value
      continue
    }

    // Handle properties that should be set as properties not attributes
    if (key === "value" || key === "checked" || key === "selected") {
      normalized[`.${key}`] = value
      continue
    }

    // Handle className -> class mapping
    if (key === "className") {
      normalized["class"] = value
      continue
    }

    // Handle htmlFor -> for mapping
    if (key === "htmlFor") {
      normalized["for"] = value
      continue
    }

    // Everything else as attribute
    normalized[key] = value
  }

  return normalized
})
