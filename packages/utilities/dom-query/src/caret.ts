export function isCaretAtStart(input: HTMLInputElement | HTMLTextAreaElement | null) {
  if (!input) return false
  try {
    return input.selectionStart === 0 && input.selectionEnd === 0
  } catch {
    return input.value === ""
  }
}

export function setCaretToEnd(input: HTMLInputElement | HTMLTextAreaElement | null) {
  if (!input) return
  try {
    if (input.ownerDocument.activeElement !== input) return
    const len = input.value.length
    input.setSelectionRange(len, len)
  } catch {}
}
