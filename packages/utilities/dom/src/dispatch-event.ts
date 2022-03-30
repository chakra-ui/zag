import { getOwnerWindow } from "./query"

function descriptor(el: HTMLElement, type: "input" | "textarea" = "input") {
  const win = getOwnerWindow(el)
  const _type = type === "input" ? "HTMLInputElement" : "HTMLTextAreaElement"
  const proto = win[_type].prototype
  return Object.getOwnPropertyDescriptor(proto, "value") ?? {}
}

export function dispatchEvent(el: HTMLElement, name: string, options: CustomEventInit) {
  const win = getOwnerWindow(el)
  const evt = new win.CustomEvent(name, options)
  el.dispatchEvent(evt)
  return evt
}

export function dispatchInputEvent(el: HTMLElement, value: string | number) {
  const win = getOwnerWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  el.type = "text"
  el.hidden = true

  descriptor(el).set?.call(el, value)

  const evt = new win.Event("input", { bubbles: true })
  el.dispatchEvent(evt)

  el.type = "hidden"
  el.hidden = false
}

export function onElementValueChange(el: HTMLInputElement, fn?: (value: string) => void) {
  if (!fn) return

  const { get, set } = descriptor(el)

  let run = true

  Object.defineProperty(el, "value", {
    get() {
      return get?.call(this)
    },
    set(value: string) {
      if (run) fn(value)
      return set?.call(this, value)
    },
  })

  return function () {
    run = false
  }
}
