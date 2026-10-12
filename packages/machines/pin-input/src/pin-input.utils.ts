const REGEX = {
  numeric: /^[0-9]+$/,
  alphabetic: /^[A-Za-z]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/i,
}

type PinInputType = keyof typeof REGEX

const CHAR_PATTERN: Record<PinInputType, string> = {
  numeric: "[0-9]",
  alphabetic: "[A-Za-z]",
  alphanumeric: "[a-zA-Z0-9]",
}

export function isValidType(type: string, value: string) {
  if (!type) return true
  return !!REGEX[type as keyof typeof REGEX]?.test(value)
}

export function isValidValue(value: string, type: PinInputType, pattern?: string) {
  if (!pattern) return isValidType(type, value)
  const regex = new RegExp(pattern, "g")
  return regex.test(value)
}

export function getPattern(length: number, type: PinInputType, pattern?: string) {
  // A custom per-character `pattern` can't be safely repeated, so only enforce length
  const char = pattern ? "." : (CHAR_PATTERN[type] ?? ".")
  return `${char}{${length}}`
}
