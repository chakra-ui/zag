export function normalizeKey(eventKey: string): string {
  // Most modern browsers already provide proper key values that match Playwright
  // We just need to handle a few edge cases
  // For single letters, ensure uppercase
  if (eventKey.length === 1 && SINGLE_LETTER_REGEX.test(eventKey)) {
    return eventKey.toUpperCase()
  }

  // Handle common aliases (case-insensitive for user convenience)
  const lower = eventKey.toLowerCase()
  const normalized = KEY_NORMALIZATION_MAP.get(lower)
  if (normalized !== undefined) {
    return normalized
  }

  // Function keys (F1-F19)
  if (FUNCTION_KEY_REGEX.test(lower)) {
    return lower.toUpperCase()
  }

  // For other keys, preserve the original casing from the browser
  // This handles keys that are already in the correct format
  return eventKey
}

// Single letter pattern
const SINGLE_LETTER_REGEX = /[a-z]/i

// Function key pattern (F1-F19)
const FUNCTION_KEY_REGEX = /^f([1-9]|1[0-9])$/

// Key normalization map for common aliases
const KEY_NORMALIZATION_MAP = new Map<string, string>([
  // Special keys
  ["backspace", "Backspace"],
  ["tab", "Tab"],
  ["clear", "Clear"],
  ["enter", "Enter"],
  ["return", "Enter"],
  ["esc", "Escape"],
  ["escape", "Escape"],
  ["space", " "],
  ["spacebar", " "],

  // Arrow keys
  ["up", "ArrowUp"],
  ["arrowup", "ArrowUp"],
  ["down", "ArrowDown"],
  ["arrowdown", "ArrowDown"],
  ["left", "ArrowLeft"],
  ["arrowleft", "ArrowLeft"],
  ["right", "ArrowRight"],
  ["arrowright", "ArrowRight"],

  // Page navigation
  ["pageup", "PageUp"],
  ["pgup", "PageUp"],
  ["pagedown", "PageDown"],
  ["pgdn", "PageDown"],
  ["home", "Home"],
  ["end", "End"],

  // Delete/Insert keys
  ["del", "Delete"],
  ["delete", "Delete"],
  ["ins", "Insert"],
  ["insert", "Insert"],
])
