import { isModifierSet } from "./modifier"
import { normalizeKey } from "./normalize"
import { MODIFIER_SEPARATOR, SEQUENCE_SEPARATOR } from "./utils"

export interface ValidationResult {
  /**
   * Whether the hotkey string is valid
   */
  valid: boolean
  /**
   * Errors that prevent the hotkey from working
   */
  errors: string[]
  /**
   * Non-fatal warnings about the hotkey
   */
  warnings: string[]
}

const KNOWN_SPECIAL_KEYS = new Set([
  "Backspace",
  "Tab",
  "Clear",
  "Enter",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "Delete",
  "Insert",
  " ",
])

const FUNCTION_KEY_REGEX = /^F([1-9]|1[0-9]|20)$/

function isKnownKey(key: string): boolean {
  // Single character keys (letters, digits, symbols)
  if (key.length === 1) return true
  // Function keys
  if (FUNCTION_KEY_REGEX.test(key)) return true
  // Named special keys
  if (KNOWN_SPECIAL_KEYS.has(key)) return true
  // Try normalizing — if it changes, the alias is recognized
  const normalized = normalizeKey(key)
  if (normalized !== key) return true
  return false
}

/**
 * Validate a hotkey string for correct syntax and recognized keys.
 */
export function validateHotkey(hotkey: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!hotkey || !hotkey.trim()) {
    errors.push("Hotkey string is empty")
    return { valid: false, errors, warnings }
  }

  const isSequence = hotkey.includes(SEQUENCE_SEPARATOR)

  if (isSequence) {
    const steps = hotkey.split(SEQUENCE_SEPARATOR)
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i].trim()
      if (!step) {
        errors.push(`Sequence step ${i + 1} is empty`)
        continue
      }
      const stepResult = validateSingleHotkey(step)
      for (const err of stepResult.errors) {
        errors.push(`Step ${i + 1}: ${err}`)
      }
      for (const warn of stepResult.warnings) {
        warnings.push(`Step ${i + 1}: ${warn}`)
      }
    }
  } else {
    const result = validateSingleHotkey(hotkey)
    errors.push(...result.errors)
    warnings.push(...result.warnings)
  }

  return { valid: errors.length === 0, errors, warnings }
}

function validateSingleHotkey(hotkey: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  const parts = hotkey.split(MODIFIER_SEPARATOR)

  if (parts.length === 0) {
    errors.push("Hotkey string is empty")
    return { errors, warnings }
  }

  // Last part is the key, everything before is modifiers
  const modifiers: string[] = []
  let keyPart: string | undefined

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim()

    if (i === parts.length - 1) {
      // Last part: could be a modifier-only hotkey (invalid) or the key
      if (isModifierSet(part) || part.toLowerCase() === "mod" || part.toLowerCase() === "controlormeta") {
        warnings.push(`"${hotkey}" contains only modifiers with no action key`)
        keyPart = part
      } else {
        keyPart = part
      }
    } else {
      if (!isModifierSet(part) && part.toLowerCase() !== "mod" && part.toLowerCase() !== "controlormeta") {
        // Empty part means the key itself is "+" (e.g., "Ctrl++")
        if (part === "") {
          keyPart = MODIFIER_SEPARATOR
          // Remaining parts after this are part of the key
          break
        }
        errors.push(`"${part}" is not a recognized modifier`)
      } else {
        const lower = part.toLowerCase()
        if (modifiers.includes(lower)) {
          warnings.push(`Duplicate modifier "${part}"`)
        }
        modifiers.push(lower)
      }
    }
  }

  if (keyPart !== undefined) {
    const normalized = normalizeKey(keyPart)
    if (!isKnownKey(normalized) && keyPart !== MODIFIER_SEPARATOR) {
      warnings.push(`"${keyPart}" is not a commonly recognized key`)
    }
  }

  return { errors, warnings }
}

/**
 * Assert that a hotkey string is valid. Throws an error if not.
 * Useful for development-time validation.
 */
export function assertValidHotkey(hotkey: string): void {
  const result = validateHotkey(hotkey)
  if (!result.valid) {
    throw new Error(`Invalid hotkey "${hotkey}": ${result.errors.join(", ")}`)
  }
}
