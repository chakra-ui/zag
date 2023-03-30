import type { Dict } from "@zag-js/core/src/types"

function camelCaseToDash(str: string) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase()
}

function styleObjectToString(styleObject: Dict) {
  return Object.entries(styleObject)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${camelCaseToDash(key)}: ${value}${typeof value === "number" ? "px" : ""}`)
    .join("; ")
}

export function normalizeAttributes(attributes: Dict) {
  const normalizedAttributes: Dict = {}

  for (const [key, value] of Object.entries(attributes)) {
    if (key === "style") {
      normalizedAttributes[key] = styleObjectToString(value)
      // filter out falsy values as html attributes like undefined are still applied
      // even if their value is falsy
    } else if (value !== undefined && value !== null && value !== false) {
      normalizedAttributes[key] = value
    }
  }

  return normalizedAttributes
}
