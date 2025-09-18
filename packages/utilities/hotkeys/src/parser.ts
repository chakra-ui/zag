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

const MODIFIER_SET = new Set(["control", "ctrl", "alt", "option", "shift", "meta", "cmd", "command", "win", "windows"])

// Context-aware parsing to handle plus key (Playwright-style)
function parseHotkeyString(hotkey: string): { modifiers: string[]; key: string } {
  const parts = hotkey.split("+").map((part) => part.trim())
  const modifiers: string[] = []
  let keyIndex = parts.length - 1 // Start from the end, assume last part is the key

  // Process each part except the last one (which we assume is the key)
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i].toLowerCase()
    const resolved = resolveControlOrMeta(part).toLowerCase()

    if (MODIFIER_SET.has(resolved) || resolved === "mod" || resolved === "controlormeta") {
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
    // For sequences, parse each step individually to preserve modifiers
    const sequenceParts = hotkey.split(">").map((part) => part.trim())
    const sequenceSteps: Array<{
      key: string
      alt?: boolean
      ctrl?: boolean
      meta?: boolean
      shift?: boolean
    }> = []

    const allKeys: string[] = []

    for (const part of sequenceParts) {
      if (part.includes("+")) {
        // This step has modifiers
        const { modifiers, key } = parseHotkeyString(part)
        const step = {
          key: normalizeKey(key),
          alt: false,
          ctrl: false,
          meta: false,
          shift: false,
        }

        // Process modifiers for this step
        for (const modifier of modifiers) {
          const resolvedModifier = resolveControlOrMeta(modifier)
          const normalized = normalizeModifier(resolvedModifier)
          switch (normalized) {
            case "Alt":
              step.alt = true
              break
            case "Control":
              step.ctrl = true
              break
            case "Meta":
              step.meta = true
              break
            case "Shift":
              step.shift = true
              break
          }
        }

        sequenceSteps.push(step)
        allKeys.push(step.key)
      } else {
        // Simple key without modifiers
        const key = normalizeKey(part)
        sequenceSteps.push({
          key,
          alt: false,
          ctrl: false,
          meta: false,
          shift: false,
        })
        allKeys.push(key)
      }
    }

    return {
      keys: allKeys,
      alt: false,
      ctrl: false,
      meta: false,
      shift: false,
      isSequence: true,
      sequenceSteps,
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

const FORM_TAGS = new Set(["input", "textarea", "select"])
const getEventTarget = (event: KeyboardEvent): Element | null => {
  const target = event.composedPath?.()[0] || event.target
  return target instanceof Element ? target : null
}

// Check if hotkey should be enabled in current context
export function shouldTrigger(event: KeyboardEvent, options: HotkeyOptions): boolean {
  const target = getEventTarget(event)
  if (!target) return true // If we can't determine target, allow the hotkey

  const tagName = target.localName
  const isContentEditable = target.getAttribute("contenteditable") === "true"

  // Check form elements
  const isFormElement = FORM_TAGS.has(tagName as any)

  if (isFormElement) {
    if (options.enableOnFormTags === false || options.enableOnFormTags === undefined) {
      return false
    }
    if (Array.isArray(options.enableOnFormTags)) {
      if (!options.enableOnFormTags.includes(tagName as any)) {
        return false
      }
    }
    // If enableOnFormTags === true, allow all form elements
  }

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
