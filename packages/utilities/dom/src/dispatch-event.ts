import { getOwnerWindow } from "./query"

type DescriptorOptions = {
  type: "input" | "textarea"
  property: "value" | "checked"
}

function getDescriptor(el: HTMLElement, options: DescriptorOptions) {
  const { type, property } = options
  const win = getOwnerWindow(el)
  const _type = type === "input" ? "HTMLInputElement" : "HTMLTextAreaElement"
  const proto = win[_type].prototype
  return Object.getOwnPropertyDescriptor(proto, property) ?? {}
}

export function dispatchInputValueEvent(el: HTMLElement, value: string | number) {
  const win = getOwnerWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return
  const desc = getDescriptor(el, { type: "input", property: "value" })
  desc.set?.call(el, value)
  const event = new win.Event("input", { bubbles: true })
  el.dispatchEvent(event)
}

export function dispatchInputCheckedEvent(el: HTMLElement, checked: boolean) {
  const win = getOwnerWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return
  const desc = getDescriptor(el, { type: "input", property: "checked" })
  desc.set?.call(el, checked)
  const event = new Event("click", { bubbles: true })
  el.dispatchEvent(event)
}

export function trackInputPropertyMutation(
  el: HTMLInputElement,
  options: DescriptorOptions & { fn?: (value: string) => void },
) {
  const { fn, property, type } = options

  if (!fn) return

  const { get, set } = getDescriptor(el, { property, type })

  let run = true

  Object.defineProperty(el, property, {
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
