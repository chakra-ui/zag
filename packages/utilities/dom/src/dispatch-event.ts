import { getOwnerWindow } from "./query"

export function dispatchInputEvent(el: HTMLElement, value: string | number) {
  const win = getOwnerWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  el.type = "text"
  el.hidden = true

  const proto = win.HTMLInputElement.prototype
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value")
  descriptor?.set?.call(el, value)

  const evt = new win.Event("input", { bubbles: true })
  el.dispatchEvent(evt)

  el.type = "hidden"
  el.hidden = false
}

export function onElementValueChange(el: HTMLInputElement, fn?: (value: string) => void) {
  if (!fn) return
  const win = getOwnerWindow(el)
  const descriptor = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value")

  if (!descriptor) return

  const { get, set } = descriptor

  Object.defineProperty(el, "value", {
    get() {
      return get?.call(this)
    },
    set(value: string) {
      fn(value)
      return set?.call(this, value)
    },
  })
}
