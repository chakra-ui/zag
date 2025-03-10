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
  const start = input.selectionStart ?? 0
  const end = input.selectionEnd ?? 0
  if (Math.abs(end - start) !== 0) return
  if (start !== 0) return
  input.setSelectionRange(input.value.length, input.value.length)
}
