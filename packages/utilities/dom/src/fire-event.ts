import { getWindow } from "./query"

export function fireCustomEvent(el: HTMLElement | null, type: string, init?: CustomEventInit) {
  if (!el) return
  const win = getWindow(el)
  const event = new win.CustomEvent(type, init)
  return el.dispatchEvent(event)
}

export function fireBlurEvent(el: HTMLElement, init?: FocusEventInit) {
  const win = getWindow(el)
  const event = new win.FocusEvent("blur", init)
  const allowed = el.dispatchEvent(event)
  const bubbleInit = { ...init, bubbles: true }
  el.dispatchEvent(new win.FocusEvent("focusout", bubbleInit))
  return allowed
}

export function fireKeyboardEvent(el: HTMLElement, type: string, init?: KeyboardEventInit) {
  const win = getWindow(el)
  const event = new win.KeyboardEvent(type, init)
  return el.dispatchEvent(event)
}

export function fireClickEvent(el: HTMLElement, init?: PointerEventInit) {
  const win = getWindow(el)
  const event =
    typeof win.PointerEvent !== "undefined" ? new win.PointerEvent("click", init) : new win.MouseEvent("click", init)
  return el.dispatchEvent(event)
}
