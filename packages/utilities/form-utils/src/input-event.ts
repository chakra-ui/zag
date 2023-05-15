type DescriptorOptions = {
  type: "HTMLInputElement" | "HTMLTextAreaElement" | "HTMLSelectElement"
  property?: "value" | "checked"
}

const getWindow = (el: HTMLElement) => el.ownerDocument.defaultView || window

function getDescriptor(el: HTMLElement, options: DescriptorOptions) {
  const { type, property = "value" } = options
  const proto = getWindow(el)[type].prototype
  return Object.getOwnPropertyDescriptor(proto, property) ?? {}
}

export function setElementValue(el: HTMLElement, value: string, option: DescriptorOptions) {
  const descriptor = getDescriptor(el, option)
  descriptor.set?.call(el, value)
}

export type InputEventOptions = {
  value: string | number
  bubbles?: boolean
}

export function dispatchInputValueEvent(el: HTMLElement | null, options: InputEventOptions) {
  if (!el) return

  const win = getWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  const { value, bubbles = true } = options

  // set property value
  const descriptor = getDescriptor(el, {
    type: "HTMLInputElement",
    property: "value",
  })

  descriptor.set?.call(el, value)

  // dispatch input event
  const event = new win.Event("input", { bubbles })
  el.dispatchEvent(event)
}

export type CheckedEventOptions = {
  checked: boolean
  bubbles?: boolean
}

export function dispatchInputCheckedEvent(el: HTMLElement | null, options: CheckedEventOptions) {
  if (!el) return

  const win = getWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  const { checked, bubbles = true } = options

  // set property value
  const descriptor = getDescriptor(el, {
    type: "HTMLInputElement",
    property: "checked",
  })

  descriptor.set?.call(el, checked)

  // dispatch click event
  const event = new win.Event("click", { bubbles })
  el.dispatchEvent(event)
}
