import { keyToCode } from "./key-to-code"
import { isModifierSet, normalizeModifier, resolveControlOrMeta } from "./modifier"
import { normalizeKey } from "./normalize"
import type { HotkeyOptions, ParsedHotkey, Platform, SequenceStep } from "./types"
import {
  getEventTarget,
  getPlatform,
  isContentEditableElement,
  isFormTag,
  isSymbolKey,
  toArray,
  MODIFIER_SEPARATOR,
  SEQUENCE_SEPARATOR,
} from "./utils"

// Context-aware parsing to handle plus key (Playwright-style)
function parseHotkeyString(hotkey: string, platform: Platform): { modifiers: string[]; key: string } {
  const parts = hotkey.split(MODIFIER_SEPARATOR)
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
  const key = parts.slice(keyIndex).join(MODIFIER_SEPARATOR).trim()
  return { modifiers, key }
}

// Parse hotkey string into structured object
export function parseHotkey(hotkey: string, platform: Platform): ParsedHotkey {
  const isSequence = hotkey.includes(SEQUENCE_SEPARATOR)

  if (isSequence) {
    // For sequences, parse each step individually to preserve modifiers
    const sequenceParts = hotkey.split(SEQUENCE_SEPARATOR)
    const sequenceSteps: SequenceStep[] = []

    const allKeys: string[] = []
    const allCodes: string[] = []

    for (const rawPart of sequenceParts) {
      const part = rawPart.trim()
      if (part.includes(MODIFIER_SEPARATOR)) {
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
  if (key && key !== SEQUENCE_SEPARATOR) {
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

type MatchableHotkeyStep = {
  key: string
  code?: string | undefined
  alt?: boolean | undefined
  ctrl?: boolean | undefined
  meta?: boolean | undefined
  shift?: boolean | undefined
}

function toMatchableHotkeySteps(parsed: ParsedHotkey): MatchableHotkeyStep[] {
  return parsed.keys.map((key, index) => ({
    key,
    code: parsed.codes?.[index],
    alt: parsed.alt,
    ctrl: parsed.ctrl,
    meta: parsed.meta,
    shift: parsed.shift,
  }))
}

// Shared matcher for a single hotkey step. Used by both plain chords and sequence steps.
export function matchesHotkeyStep(
  step: {
    key: string
    code?: string | undefined
    alt?: boolean | undefined
    ctrl?: boolean | undefined
    meta?: boolean | undefined
    shift?: boolean | undefined
  },
  event: KeyboardEvent,
): boolean {
  const eventKey = normalizeKey(event.key)
  const keyMatches = step.key === eventKey
  const isSymbol = isSymbolKey(step.key)

  if (isSymbol) {
    // Try key match first. Fall back to physical code when a modifier (Alt/Meta)
    // has transformed the character (e.g., macOS Option+/ → "÷" but code is still "Slash").
    // Only use code fallback when a modifier is held, to avoid false positives on
    // international layouts where the same physical key produces a different character.
    const modifierHeld = event.altKey || event.metaKey || event.ctrlKey
    if (!keyMatches && !(modifierHeld && step.code && step.code === event.code)) return false

    // AltGraph guard for symbols: real AltGr (European) sets both ctrlKey and altKey.
    // macOS Firefox Option only sets altKey. Only neutralize modifiers for real AltGr.
    const isAltGraph = event.getModifierState?.("AltGraph") ?? false
    const isRealAltGr = isAltGraph && event.ctrlKey
    const effectiveCtrl = isRealAltGr ? false : event.ctrlKey
    const effectiveAlt = isRealAltGr ? false : event.altKey

    if ((step.ctrl || false) !== effectiveCtrl) return false
    if ((step.meta || false) !== event.metaKey) return false
    if (step.shift && !event.shiftKey) return false
    if (step.alt && !effectiveAlt) return false

    return true
  }

  // AltGraph guard: on European keyboards, AltGr produces composed characters
  // (e.g., AltGr+E → €) and reports ctrlKey/altKey as true. When AltGraph is active,
  // the user is typing a character, not triggering a shortcut. Block the match entirely.
  // Exception: macOS Firefox reports AltGraph for plain Option presses but does NOT
  // set ctrlKey — only altKey. So we only block when ctrlKey is also set (real AltGr).
  const isAltGraph = event.getModifierState?.("AltGraph") ?? false
  if (isAltGraph && event.ctrlKey) return false

  if ((step.alt || false) !== event.altKey) return false
  if ((step.ctrl || false) !== event.ctrlKey) return false
  if ((step.meta || false) !== event.metaKey) return false
  if ((step.shift || false) !== event.shiftKey) return false

  return keyMatches || (!!step.code && step.code === event.code)
}

// Check if hotkey matches current keyboard state
export function matchesHotkey(parsed: ParsedHotkey, event: KeyboardEvent): boolean {
  return toMatchableHotkeySteps(parsed).some((step) => matchesHotkeyStep(step, event))
}

// Check if hotkey should be enabled in current context
export function shouldTrigger(event: KeyboardEvent, options: HotkeyOptions): boolean {
  const target = getEventTarget(event)
  if (!target) return true // If we can't determine target, allow the hotkey

  const tagName = target.localName
  const isContentEditable = isContentEditableElement(target)

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
export function isHotKey(
  hotkey: string | string[],
  event: KeyboardEvent,
  options: HotkeyOptions = {},
  platform?: Platform,
): boolean {
  // Dead keys (accent/compose keys on international layouts) cannot match any shortcut
  if (event.key === "Dead") return false
  // Check if the hotkey should trigger in current context
  if (!shouldTrigger(event, options)) return false
  const resolved = platform ?? getPlatform()
  return toArray(hotkey).some((h) => {
    const parsed = parseHotkey(h, resolved)
    return matchesHotkey(parsed, event)
  })
}

// Check if two hotkey strings are semantically equal (resolves aliases like mod → Meta/Control)
export function isHotkeyEqual(a: string, b: string, platform?: Platform): boolean {
  const resolved = platform ?? getPlatform()
  const pa = parseHotkey(a, resolved)
  const pb = parseHotkey(b, resolved)

  if (pa.isSequence !== pb.isSequence) return false

  // For sequences, compare each step's key and modifiers individually
  if (pa.isSequence && pb.isSequence) {
    const stepsA = pa.sequenceSteps
    const stepsB = pb.sequenceSteps
    if (!stepsA || !stepsB || stepsA.length !== stepsB.length) return false
    return stepsA.every((stepA, i) => {
      const stepB = stepsB[i]
      return (
        stepA.key === stepB.key &&
        (stepA.ctrl ?? false) === (stepB.ctrl ?? false) &&
        (stepA.alt ?? false) === (stepB.alt ?? false) &&
        (stepA.shift ?? false) === (stepB.shift ?? false) &&
        (stepA.meta ?? false) === (stepB.meta ?? false)
      )
    })
  }

  // For chords, compare top-level modifiers and keys
  return (
    pa.ctrl === pb.ctrl &&
    pa.alt === pb.alt &&
    pa.shift === pb.shift &&
    pa.meta === pb.meta &&
    pa.keys.length === pb.keys.length &&
    pa.keys.every((k, i) => k === pb.keys[i])
  )
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
