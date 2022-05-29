export function fireEvent(el: Element, type: string, init?: EventInit) {
  const event = new Event(type, init)
  return el.dispatchEvent(event)
}

export function fireCustomEvent(el: Element, type: string, init?: CustomEventInit) {
  const event = new CustomEvent(type, init)
  return el.dispatchEvent(event)
}

export function fireBlurEvent(el: Element, init?: FocusEventInit) {
  const event = new FocusEvent("blur", init)
  const allowed = el.dispatchEvent(event)
  const bubbleInit = { ...init, bubbles: true }
  el.dispatchEvent(new FocusEvent("focusout", bubbleInit))
  return allowed
}

export function fireKeyboardEvent(el: Element, type: string, init?: KeyboardEventInit) {
  const event = new KeyboardEvent(type, init)
  return el.dispatchEvent(event)
}

export function fireClickEvent(el: Element, init?: PointerEventInit) {
  const event = typeof PointerEvent !== "undefined" ? new PointerEvent("click", init) : new MouseEvent("click", init)
  return el.dispatchEvent(event)
}
