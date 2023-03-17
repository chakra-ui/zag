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

export function dispatchInputValueEvent(el: HTMLElement | null, value: string | number) {
  if (!el) return

  const win = getWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  // set property value
  const desc = getDescriptor(el, { type: "HTMLInputElement", property: "value" })
  desc.set?.call(el, value)

  // dispatch input event
  const event = new win.Event("input", { bubbles: true })
  el.dispatchEvent(event)
}

export function dispatchSelectValueEvent(el: HTMLElement | null, value: string | number) {
  if (!el) return

  const win = getWindow(el)
  if (!(el instanceof win.HTMLSelectElement)) return

  // set property value
  const desc = getDescriptor(el, { type: "HTMLSelectElement", property: "value" })
  desc.set?.call(el, value)

  // dispatch change event
  const event = new win.Event("change", { bubbles: true })
  el.dispatchEvent(event)
}

export function dispatchInputCheckedEvent(el: HTMLElement | null, checked: boolean) {
  if (!el) return

  const win = getWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  // set property value
  const desc = getDescriptor(el, { type: "HTMLInputElement", property: "checked" })
  desc.set?.call(el, checked)

  // dispatch click event
  const event = new win.Event("click", { bubbles: true })
  el.dispatchEvent(event)
}
