function camelCaseToDash(str: string) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase()
}

function styleObjectToString(styleObject: Record<string, any>) {
  return Object.entries(styleObject)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${camelCaseToDash(key)}: ${value}${typeof value === "number" ? "px" : ""}`)
    .join("; ")
}

export function normalizeAttributes(attributes: Record<string, any>) {
  const normalizedAttributes: Record<string, any> = {}

  for (const [key, value] of Object.entries(attributes)) {
    if (key === "style") {
      console.log("style", styleObjectToString(value))
      normalizedAttributes[key] = styleObjectToString(value)
      // filter out falsy values as html attributes like undefined are still applied
      // even if their value is falsy
    } else if (value !== undefined && value !== null && value !== false) {
      normalizedAttributes[key] = value
    }
  }

  return normalizedAttributes
}
