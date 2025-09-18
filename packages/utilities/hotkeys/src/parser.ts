import type { ParsedHotkey, HotkeyOptions } from "./types"
import { normalizeKey, resolveControlOrMeta } from "./utils"

// Normalize user input for modifiers
function normalizeModifier(key: string): string {
  const lower = key.toLowerCase()
  switch (lower) {
    case "ctrl":
    case "control":
      return "Control"
    case "alt":
    case "option":
      return "Alt"
    case "shift":
      return "Shift"
    case "meta":
    case "cmd":
    case "command":
    case "win":
    case "windows":
      return "Meta"
    default:
      return key
  }
}

// Context-aware parsing to handle plus key (Playwright-style)
function parseHotkeyString(hotkey: string): { modifiers: string[]; key: string } {
  const modifierSet = new Set(["control", "ctrl", "alt", "option", "shift", "meta", "cmd", "command", "win", "windows"])

  const parts = hotkey.split("+").map((part) => part.trim())
  const modifiers: string[] = []
  let keyIndex = parts.length - 1 // Start from the end, assume last part is the key

  // Process each part except the last one (which we assume is the key)
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i].toLowerCase()
    const resolved = resolveControlOrMeta(part).toLowerCase()

    if (modifierSet.has(resolved) || resolved === "mod" || resolved === "controlormeta") {
      modifiers.push(parts[i]) // Keep original casing for processing
    } else {
      // This part is not a modifier, so everything from here is the key
      keyIndex = i
      break
    }
  }

  // Join remaining parts as the key (handles cases like "Control++" where key is "+")
  const key = parts.slice(keyIndex).join("+")
  return { modifiers, key }
}

// Parse hotkey string into structured object
export function parseHotkey(hotkey: string): ParsedHotkey {
  const isSequence = hotkey.includes(">")

  if (isSequence) {
    // For sequences, split by > and return all keys without modifiers
    const sequenceKeys = hotkey.split(">").map((key) => key.trim())
    return {
      keys: sequenceKeys.map((k) => normalizeKey(k)),
      alt: false,
      ctrl: false,
      meta: false,
      shift: false,
      isSequence: true,
    }
  }

  // Use context-aware parsing for combinations
  const { modifiers, key } = parseHotkeyString(hotkey)
  const result: ParsedHotkey = {
    keys: [],
    alt: false,
    ctrl: false,
    meta: false,
    shift: false,
    isSequence: false,
  }

  // Process modifiers
  for (const modifier of modifiers) {
    const resolvedModifier = resolveControlOrMeta(modifier)
    const normalized = normalizeModifier(resolvedModifier)

    switch (normalized) {
      case "Alt":
        result.alt = true
        break
      case "Control":
        result.ctrl = true
        break
      case "Meta":
        result.meta = true
        break
      case "Shift":
        result.shift = true
        break
    }
  }

  // Process the main key (now we can handle "+" as a literal key)
  if (key && key !== ">") {
    result.keys.push(normalizeKey(key))
  }

  return result
}

// Check if hotkey matches current keyboard state
export function matchesHotkey(parsed: ParsedHotkey, event: KeyboardEvent): boolean {
  // Check modifiers
  if (parsed.alt !== event.altKey) return false
  if (parsed.ctrl !== event.ctrlKey) return false
  if (parsed.meta !== event.metaKey) return false
  if (parsed.shift !== event.shiftKey) return false

  // Check main key
  const eventKey = normalizeKey(event.key, event.code)
  return parsed.keys.some((key) => key === eventKey)
}

// Check if hotkey should be enabled in current context
export function shouldTrigger(event: KeyboardEvent, options: HotkeyOptions, activeScopes: Set<string>): boolean {
  if (!options.enabled) return false

  // Check scopes
  if (options.scopes) {
    const hotkeyScopes = Array.isArray(options.scopes) ? options.scopes : [options.scopes]
    const hasMatchingScope = hotkeyScopes.some((scope) => activeScopes.has(scope) || activeScopes.has("*"))
    if (!hasMatchingScope) return false
  }

  const target = (event.composedPath?.()[0] || event.target) as HTMLElement
  const tagName = target?.localName
  const isFormElement = ["input", "textarea", "select"].includes(tagName)
  const isContentEditable = target?.contentEditable === "true"

  if (isFormElement && !options.enableOnFormTags) return false
  if (isContentEditable && !options.enableOnContentEditable) return false

  return true
}

// Simple priority scoring (higher = more specific)
export function getHotkeyPriority(parsed: ParsedHotkey): number {
  let priority = 0

  // Sequences get highest priority
  if (parsed.isSequence) priority += 1000

  // Each modifier adds to priority
  if (parsed.alt) priority += 100
  if (parsed.ctrl) priority += 100
  if (parsed.meta) priority += 100
  if (parsed.shift) priority += 100

  // Multiple keys add to priority
  priority += parsed.keys.length * 10

  return priority
}
