import type { ParsedHotkey, HotkeyOptions } from "./types"
import { mapCode, resolveCtrlOrMeta } from "./utils"

// Parse hotkey string into structured object
export function parseHotkey(hotkey: string): ParsedHotkey {
  const isSequence = hotkey.includes(">")

  if (isSequence) {
    // For sequences, split by > and return all keys without modifiers
    const sequenceKeys = hotkey.split(">").map((key) => key.trim().toLowerCase())
    return {
      keys: sequenceKeys.map(mapCode),
      alt: false,
      ctrl: false,
      meta: false,
      shift: false,
      isSequence: true,
    }
  }

  // For combinations, parse modifiers and key
  const parts = hotkey.toLowerCase().split(/[\s+]+/)
  const result: ParsedHotkey = {
    keys: [],
    alt: false,
    ctrl: false,
    meta: false,
    shift: false,
    isSequence: false,
  }

  for (const part of parts) {
    const resolvedPart = resolveCtrlOrMeta(part)
    switch (resolvedPart) {
      case "alt":
      case "option":
        result.alt = true
        break
      case "ctrl":
      case "control":
        result.ctrl = true
        break
      case "meta":
      case "cmd":
      case "command":
        result.meta = true
        break
      case "shift":
        result.shift = true
        break
      default:
        if (resolvedPart && ![">", "+"].includes(resolvedPart)) {
          result.keys.push(mapCode(resolvedPart))
        }
    }
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
  const eventKey = mapCode(event.code || event.key)
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
