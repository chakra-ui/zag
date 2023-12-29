/**
 * Credits: https://github.com/react-component/input-number/blob/master/src/hooks/useCursor.ts
 */

interface Selection {
  start?: number
  end?: number
  value?: string
  beforeTxt?: string
  afterTxt?: string
}

export function recordCursor(inputEl: HTMLInputElement): Selection | undefined {
  if (inputEl.ownerDocument.activeElement !== inputEl) return
  try {
    const { selectionStart: start, selectionEnd: end, value } = inputEl
    const beforeTxt = value.substring(0, start!)
    const afterTxt = value.substring(end!)
    return {
      start: start!,
      end: end!,
      value,
      beforeTxt,
      afterTxt,
    }
  } catch {}
}

export function restoreCursor(inputEl: HTMLInputElement, selection: Selection | undefined) {
  if (inputEl.ownerDocument.activeElement !== inputEl) return

  if (!selection) {
    inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length)
    return
  }

  try {
    const { value } = inputEl
    const { beforeTxt = "", afterTxt = "", start } = selection

    let startPos = value.length

    if (value.endsWith(afterTxt)) {
      startPos = value.length - afterTxt.length
    } else if (value.startsWith(beforeTxt)) {
      startPos = beforeTxt.length
    } else if (start != null) {
      const beforeLastChar = beforeTxt[start - 1]
      const newIndex = value.indexOf(beforeLastChar, start - 1)
      if (newIndex !== -1) {
        startPos = newIndex + 1
      }
    }

    inputEl.setSelectionRange(startPos, startPos)
  } catch {}
}
