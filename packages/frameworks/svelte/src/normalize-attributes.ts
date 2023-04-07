import type { Dict } from "@zag-js/core/src/types"

const isFalsy = (value: any) => {
  return value === undefined || value === null || value === false
}

export function normalizeAttributes(attributes: Dict) {
  const normalizedAttributes: Dict = {}

  for (const [key, value] of Object.entries(attributes)) {
    if (!isFalsy(value)) normalizedAttributes[key] = value
  }

  return normalizedAttributes
}
