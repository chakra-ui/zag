import { keyToCode } from "./key-to-code"
import { isModifierSet, normalizeModifier, resolveControlOrMeta } from "./modifier"
import { normalizeKey } from "./normalize"
import type { HotkeyOptions, ParsedHotkey, Platform, SequenceStep } from "./types"
import { getEventTarget, getPlatform, isFormTag, toArray } from "./utils"

// Context-aware parsing to handle plus key (Playwright-style)
function parseHotkeyString(hotkey: string, platform: Platform): { modifiers: string[]; key: string } {
  const parts = hotkey.split("+")
  const modifiers: string[] = []
  let keyIndex = parts.length - 1 // Start from the end, assume last part is the key

  // Process each part except the last one (which we assume is the key)
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i].trim().toLowerCase()
    const resolved = resolveControlOrMeta(part, platform).toLowerCase()

    // Skip empty parts (from consecutive + characters)
    if (part === "") {
      keyIndex = i
      break
    }

    if (isModifierSet(resolved) || resolved === "mod" || resolved === "controlormeta") {
      modifiers.push(parts[i].trim()) // Keep original casing for processing
    } else {
      // This part is not a modifier, so everything from here is the key
      keyIndex = i
      break
    }
  }

  // Join remaining parts as the key (handles cases like "Control++" where key is "+")
  const key = parts.slice(keyIndex).join("+").trim()
  return { modifiers, key }
}

// Parse hotkey string into structured object
export function parseHotkey(hotkey: string, platform: Platform): ParsedHotkey {
  const isSequence = hotkey.includes(">")

  if (isSequence) {
    // For sequences, parse each step individually to preserve modifiers
    const sequenceParts = hotkey.split(">")
    const sequenceSteps: SequenceStep[] = []

    const allKeys: string[] = []
    const allCodes: string[] = []

    for (const rawPart of sequenceParts) {
      const part = rawPart.trim()
      if (part.includes("+")) {
        // This step has modifiers
        const { modifiers, key } = parseHotkeyString(part, platform)
        const step = {
          key: normalizeKey(key),
          alt: false,
          ctrl: false,
          meta: false,
          shift: false,
        }

        // Process modifiers for this step
        for (const modifier of modifiers) {
          const resolvedModifier = resolveControlOrMeta(modifier, platform)
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

        // Add corresponding physical key code
        const code = keyToCode(step.key)
        if (code != null) {
          allCodes.push(code)
        }
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

        // Add corresponding physical key code
        const code = keyToCode(key)
        if (code != null) {
          allCodes.push(code)
        }
      }
    }

    return {
      keys: allKeys,
      codes: allCodes.length > 0 ? allCodes : undefined,
      alt: false,
      ctrl: false,
      meta: false,
      shift: false,
      isSequence: true,
      sequenceSteps,
    }
  }

  // Use context-aware parsing for combinations
  const { modifiers, key } = parseHotkeyString(hotkey, platform)
  const result: ParsedHotkey = {
    keys: [],
    codes: [],
    alt: false,
    ctrl: false,
    meta: false,
    shift: false,
    isSequence: false,
  }

  // Process modifiers
  for (const modifier of modifiers) {
    const resolvedModifier = resolveControlOrMeta(modifier, platform)
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
    const normalizedKey = normalizeKey(key)
    result.keys.push(normalizedKey)

    // Add corresponding physical key code for layout-independent matching
    const code = keyToCode(normalizedKey)
    if (code != null) {
      result.codes?.push(code)
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

  // Check main key - match EITHER logical key OR physical code for layout independence
  const eventKey = normalizeKey(event.key)
  const eventCode = event.code

  // Match if either the logical key matches OR the physical code matches
  const keyMatches = parsed.keys.some((key) => key === eventKey)
  const codeMatches = parsed.codes ? parsed.codes.some((code) => code === eventCode) : false

  return keyMatches || codeMatches
}

// Check if hotkey should be enabled in current context
export function shouldTrigger(event: KeyboardEvent, options: HotkeyOptions): boolean {
  const target = getEventTarget(event)
  if (!target) return true // If we can't determine target, allow the hotkey

  const tagName = target.localName
  const isContentEditable = target.getAttribute("contenteditable") === "true"

  if (isFormTag(tagName)) {
    if (options.enableOnFormTags === false || options.enableOnFormTags === undefined) {
      return false
    }
    if (Array.isArray(options.enableOnFormTags)) {
      if (!options.enableOnFormTags.includes(tagName)) {
        return false
      }
    }
    // If enableOnFormTags === true, allow all form elements
  }

  if (isContentEditable && !options.enableOnContentEditable) return false

  return true
}

// Check if a keyboard event matches a hotkey string or array of hotkey strings
export function isHotKey(hotkey: string | string[], event: KeyboardEvent, options: HotkeyOptions = {}): boolean {
  // Check if the hotkey should trigger in current context
  if (!shouldTrigger(event, options)) return false
  const platform = getPlatform()
  return toArray(hotkey).some((h) => {
    const parsed = parseHotkey(h, platform)
    return matchesHotkey(parsed, event)
  })
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
