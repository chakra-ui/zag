/**
 * Convert a logical key to its physical key code for layout-independent matching
 * @param key - The logical key to convert
 * @returns The physical key code
 */
export function keyToCode(key: string): string | undefined {
  // Single uppercase letter -> KeyX
  if (UPPERCASE_LETTER_REGEX.test(key)) return `Key${key}`

  // Single digit -> DigitX
  if (SINGLE_DIGIT_REGEX.test(key)) return `Digit${key}`

  // Function keys F1-F20
  if (FUNCTION_KEY_WITH_F20_REGEX.test(key)) return key

  // Navigation and special keys that map directly
  if (DIRECT_KEY_CODES.has(key)) return key

  // Special character mappings
  return SPECIAL_KEY_CODES.get(key)
}

// Pattern matching for keyToCode function
const UPPERCASE_LETTER_REGEX = /^[A-Z]$/
const SINGLE_DIGIT_REGEX = /^[0-9]$/
const FUNCTION_KEY_WITH_F20_REGEX = /^F([1-9]|1[0-9]|20)$/

// Navigation and special keys that map directly to their code names
const DIRECT_KEY_CODES = new Set([
  "Enter",
  "Tab",
  "Backspace",
  "Delete",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "Insert",
])

// Special character to code mappings
const SPECIAL_KEY_CODES = new Map<string, string>([
  [" ", "Space"],
  ["-", "Minus"],
  ["=", "Equal"],
  ["+", "Equal"], // + is typically Shift + =, so same physical key
  ["[", "BracketLeft"],
  ["]", "BracketRight"],
  [";", "Semicolon"],
  ["'", "Quote"],
  ["`", "Backquote"],
  ["\\", "Backslash"],
  [",", "Comma"],
  [".", "Period"],
  ["/", "Slash"],
])
