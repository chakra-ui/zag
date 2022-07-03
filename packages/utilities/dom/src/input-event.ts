import { getWindow } from "./query"

type DescriptorOptions = {
  type: "HTMLInputElement" | "HTMLTextAreaElement" | "HTMLSelectElement"
  property: "value" | "checked"
}

function getDescriptor(el: HTMLElement, options: DescriptorOptions) {
  const { type, property } = options
  const proto = getWindow(el)[type].prototype
  return Object.getOwnPropertyDescriptor(proto, property) ?? {}
}

export function dispatchInputValueEvent(el: HTMLElement, value: string | number) {
  const win = getWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  // set property value
  const desc = getDescriptor(el, { type: "HTMLInputElement", property: "value" })
  desc.set?.call(el, value)

  // dispatch input event
  const event = new win.Event("input", { bubbles: true })
  el.dispatchEvent(event)
}

export function dispatchInputCheckedEvent(el: HTMLElement, checked: boolean) {
  const win = getWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  // set property value
  const desc = getDescriptor(el, { type: "HTMLInputElement", property: "checked" })
  desc.set?.call(el, checked)

  // dispatch click event
  const event = new win.Event("click", { bubbles: true })
  el.dispatchEvent(event)
}

export function trackInputPropertyMutation(
  el: HTMLInputElement | null,
  options: DescriptorOptions & { fn?: (value: string) => void },
) {
  const { fn, property, type } = options

  if (!fn || !el) return

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

  return () => {
    run = false
  }
}
