// Check if it looks like a valid hex value (3, 4, 6, or 8 hex characters)
const HEX_REGEX = /^[0-9a-fA-F]{3,8}$/

export function isValidHex(value: string) {
  return HEX_REGEX.test(value)
}

export function prefixHex(value: string) {
  if (value.startsWith("#")) return value
  if (isValidHex(value)) return `#${value}`
  return value
}
