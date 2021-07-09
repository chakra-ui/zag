import type { KeyboardEvent } from "react"

/**
 * Determine if the event is a valid numeric keyboard event.
 * We use this so we can prevent non-number characters in the input
 */
export function isValidNumericKeyboardEvent(event: KeyboardEvent) {
  if (event.key == null) return true

  const isModifierKey = event.ctrlKey || event.altKey || event.metaKey
  if (isModifierKey) return true

  const isSingleCharacterKey = event.key.length === 1
  if (!isSingleCharacterKey) return true

  return isFloatingPoint(event.key)
}

function isFloatingPoint(character: string) {
  return /^[Ee0-9+\-.]$/.test(character)
}

export function sanitize(value: string) {
  return value.split("").filter(isFloatingPoint).join("")
}
