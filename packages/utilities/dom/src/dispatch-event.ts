import { getOwnerWindow } from "./query"

type DispatchEventOptions = {
  type?: "input" | "checked"
  key?: string
  value: string | number | boolean
  hidden?: boolean
}

export function dispatchInputEvent(el: HTMLElement, opts: DispatchEventOptions) {
  const { key = "value", value, type = "input", hidden = true } = opts
  const win = getOwnerWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  if (hidden) {
    el.type = "text"
    el.hidden = true
  }

  const proto = win.HTMLInputElement.prototype
  const set = Object.getOwnPropertyDescriptor(proto, key)?.set

  set?.call(el, value)

  const evt = new win.Event(type, { bubbles: true })
  el.dispatchEvent(evt)

  if (hidden) {
    el.type = "hidden"
    el.hidden = false
  }
}
