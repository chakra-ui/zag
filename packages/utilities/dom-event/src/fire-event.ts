export function fireCustomEvent(el: HTMLElement | null, type: string, init?: CustomEventInit) {
  if (!el) return
  const win = el.ownerDocument.defaultView || window
  const event = new win.CustomEvent(type, init)
  return el.dispatchEvent(event)
}

export function fireBlurEvent(el: HTMLElement, init?: FocusEventInit) {
  const win = el.ownerDocument.defaultView || window
  const event = new win.FocusEvent("blur", init)
  const allowed = el.dispatchEvent(event)
  const bubbleInit = { ...init, bubbles: true }
  el.dispatchEvent(new win.FocusEvent("focusout", bubbleInit))
  return allowed
}
