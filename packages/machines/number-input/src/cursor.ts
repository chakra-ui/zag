import type { Scope } from "@zag-js/core"

interface Selection {
  start: number
  end: number
  value: string
}

export function recordCursor(inputEl: HTMLInputElement | null, scope: Scope): Selection | undefined {
  if (!inputEl || !scope.isActiveElement(inputEl)) return

  try {
    const { selectionStart: start, selectionEnd: end, value } = inputEl
    if (start == null || end == null) return undefined

    return { start, end, value }
  } catch {
    return undefined
  }
}

export function restoreCursor(inputEl: HTMLInputElement | null, selection: Selection | undefined, scope: Scope) {
  if (!inputEl || !scope.isActiveElement(inputEl)) return

  if (!selection) {
    const len = inputEl.value.length
    inputEl.setSelectionRange(len, len)
    return
  }

  try {
    const newValue = inputEl.value
    const { start, end, value: oldValue } = selection

    // If the value hasn't changed, restore exact position
    if (newValue === oldValue) {
      inputEl.setSelectionRange(start, end)
      return
    }

    // Calculate new cursor position based on text changes
    const newStart = getNewCursorPosition(oldValue, newValue, start)
    const newEnd = start === end ? newStart : getNewCursorPosition(oldValue, newValue, end)

    // Ensure positions are within bounds
    const clampedStart = Math.max(0, Math.min(newStart, newValue.length))
    const clampedEnd = Math.max(clampedStart, Math.min(newEnd, newValue.length))

    inputEl.setSelectionRange(clampedStart, clampedEnd)
  } catch {
    // Fallback to end of input
    const len = inputEl.value.length
    inputEl.setSelectionRange(len, len)
  }
}

function getNewCursorPosition(oldValue: string, newValue: string, oldPosition: number): number {
  // Split the old value into before and after the cursor
  const beforeCursor = oldValue.slice(0, oldPosition)
  const afterCursor = oldValue.slice(oldPosition)

  // Find the longest common prefix
  let prefixLength = 0
  const maxPrefixLength = Math.min(beforeCursor.length, newValue.length)

  for (let i = 0; i < maxPrefixLength; i++) {
    if (beforeCursor[i] === newValue[i]) {
      prefixLength = i + 1
    } else {
      break
    }
  }

  // Find the longest common suffix
  let suffixLength = 0
  const maxSuffixLength = Math.min(afterCursor.length, newValue.length - prefixLength)

  for (let i = 0; i < maxSuffixLength; i++) {
    const oldIndex = afterCursor.length - 1 - i
    const newIndex = newValue.length - 1 - i

    if (afterCursor[oldIndex] === newValue[newIndex]) {
      suffixLength = i + 1
    } else {
      break
    }
  }

  // Calculate the new position
  // If we have a good prefix match, use it
  if (prefixLength >= beforeCursor.length) {
    return prefixLength
  }

  // If we have a good suffix match, calculate from the end
  if (suffixLength >= afterCursor.length) {
    return newValue.length - suffixLength
  }

  // If we have partial matches, prefer the prefix
  if (prefixLength > 0) {
    return prefixLength
  }

  // If we have partial suffix match
  if (suffixLength > 0) {
    return newValue.length - suffixLength
  }

  // Fallback: maintain relative position
  if (oldValue.length > 0) {
    const ratio = oldPosition / oldValue.length
    return Math.round(ratio * newValue.length)
  }

  return newValue.length
}
