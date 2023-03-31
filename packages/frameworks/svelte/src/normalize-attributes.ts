import type { Dict } from "@zag-js/core/src/types"

export function normalizeAttributes(attributes: Dict) {
  const normalizedAttributes: Dict = {}

  for (const [key, value] of Object.entries(attributes)) {
    if (value !== undefined && value !== null && value !== false) {
      normalizedAttributes[key] = value
    }
  }

  return normalizedAttributes
}
