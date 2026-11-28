import { isActiveElement } from "./node"

export interface InputSelection {
  start: number
  end: number
  value: string
}

export function recordCursor(inputEl: HTMLInputElement | null): InputSelection | undefined {
  if (!inputEl || !isActiveElement(inputEl)) return

  try {
    const { selectionStart: start, selectionEnd: end, value } = inputEl
    if (start == null || end == null) return undefined

    return { start, end, value }
  } catch {
    return undefined
  }
}

export function restoreCursor(inputEl: HTMLInputElement | null, selection: InputSelection | undefined) {
  if (!inputEl || !isActiveElement(inputEl)) return

  if (!selection) {
    const len = inputEl.value.length
    inputEl.setSelectionRange(len, len)
    return
  }

  try {
    const newValue = inputEl.value
    const { start, end, value: oldValue } = selection

    if (newValue === oldValue) {
      inputEl.setSelectionRange(start, end)
      return
    }

    const newStart = getNextCursorPosition(oldValue, newValue, start)
    const newEnd = start === end ? newStart : getNextCursorPosition(oldValue, newValue, end)

    const clampedStart = Math.max(0, Math.min(newStart, newValue.length))
    const clampedEnd = Math.max(clampedStart, Math.min(newEnd, newValue.length))

    inputEl.setSelectionRange(clampedStart, clampedEnd)
  } catch {
    const len = inputEl.value.length
    inputEl.setSelectionRange(len, len)
  }
}

/** Where the cursor goes after the value changes, keeping it next to the text it was beside */
export function getNextCursorPosition(oldValue: string, newValue: string, oldPosition: number): number {
  const beforeCursor = oldValue.slice(0, oldPosition)
  const afterCursor = oldValue.slice(oldPosition)

  let prefixLength = 0
  const maxPrefixLength = Math.min(beforeCursor.length, newValue.length)

  for (let i = 0; i < maxPrefixLength; i++) {
    if (beforeCursor[i] === newValue[i]) {
      prefixLength = i + 1
    } else {
      break
    }
  }

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

  // the text before the cursor survived whole
  if (beforeCursor.length > 0 && prefixLength >= beforeCursor.length) {
    return prefixLength
  }

  // the text after the cursor survived whole
  if (suffixLength >= afterCursor.length) {
    return newValue.length - suffixLength
  }

  // partial matches, the prefix first
  if (prefixLength > 0) {
    return prefixLength
  }

  if (suffixLength > 0) {
    return newValue.length - suffixLength
  }

  // nothing survived, from a cursor at the start
  if (oldPosition === 0 && prefixLength === 0 && suffixLength === 0) {
    return newValue.length
  }

  // keep the cursor at the same share of the value
  if (oldValue.length > 0) {
    const ratio = oldPosition / oldValue.length
    return Math.round(ratio * newValue.length)
  }

  return newValue.length
}

export function isTypingAtEnd(previousValue: string, selection: InputSelection | undefined): boolean {
  if (!selection) return false
  const { start, end, value } = selection
  return value.length > previousValue.length && start === end && end === value.length
}
