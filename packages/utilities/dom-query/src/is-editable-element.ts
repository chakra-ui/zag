import { getWindow } from "./env"
import { isHTMLElement } from "./is"

export function isEditableElement(el: HTMLElement | EventTarget | null) {
  if (el == null || !isHTMLElement(el)) {
    return false
  }

  try {
    const win = getWindow(el)
    return (
      (el instanceof win.HTMLInputElement && el.selectionStart != null) ||
      /(textarea|select)/.test(el.localName) ||
      el.isContentEditable
    )
  } catch {
    return false
  }
}
