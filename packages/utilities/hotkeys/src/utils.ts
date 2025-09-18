import type { RootNode } from "./types"

const typeOf = (value: unknown) => Object.prototype.toString.call(value).slice(8, -1)
const isDocument = (value: unknown): value is Document => typeOf(value) === "Document"

export function getDoc(root: RootNode): Document {
  return isDocument(root) ? root : root.ownerDocument || document
}

export function getWin(root: RootNode): Window {
  return getDoc(root).defaultView || window
}

// Detect platform
const NA_REGEX = /Mac|iPod|iPhone|iPad/
export function isMac(): boolean {
  return typeof navigator !== "undefined" && NA_REGEX.test(navigator.userAgent)
}

// Function key pattern (F1-F19)
const FUNCTION_KEY_REGEX = /^f([1-9]|1[0-9])$/

// Single letter pattern
const SINGLE_LETTER_REGEX = /[a-z]/i

// Map keyboard event keys to Playwright-style naming
export function normalizeKey(eventKey: string, _eventCode?: string): string {
  // Most modern browsers already provide proper key values that match Playwright
  // We just need to handle a few edge cases

  // For single letters, ensure uppercase
  if (eventKey.length === 1 && SINGLE_LETTER_REGEX.test(eventKey)) {
    return eventKey.toUpperCase()
  }

  // Handle common aliases (case-insensitive for user convenience)
  const lower = eventKey.toLowerCase()
  switch (lower) {
    // Special keys
    case "backspace":
      return "Backspace"
    case "tab":
      return "Tab"
    case "clear":
      return "Clear"
    case "enter":
    case "return":
      return "Enter"
    case "esc":
    case "escape":
      return "Escape"
    case "space":
    case "spacebar":
      return " "

    // Arrow keys
    case "up":
    case "arrowup":
      return "ArrowUp"
    case "down":
    case "arrowdown":
      return "ArrowDown"
    case "left":
    case "arrowleft":
      return "ArrowLeft"
    case "right":
    case "arrowright":
      return "ArrowRight"

    // Page navigation
    case "pageup":
    case "pgup":
      return "PageUp"
    case "pagedown":
    case "pgdn":
      return "PageDown"
    case "home":
      return "Home"
    case "end":
      return "End"

    // Delete keys
    case "del":
    case "delete":
      return "Delete"
    case "ins":
    case "insert":
      return "Insert"

    default:
      // Function keys (F1-F19)
      if (FUNCTION_KEY_REGEX.test(lower)) {
        return lower.toUpperCase()
      }

      // For other keys, preserve the original casing from the browser
      // This handles keys that are already in the correct format
      if (eventKey === " ") return " "
      return eventKey
  }
}

// Resolve mod and ControlOrMeta to appropriate modifier based on platform
export function resolveControlOrMeta(key: string): string {
  const lower = key.toLowerCase()
  if (lower === "mod" || lower === "controlormeta") {
    return isMac() ? "Meta" : "Control"
  }
  return key
}
