interface DescriptorOptions {
  type?: "HTMLInputElement" | "HTMLTextAreaElement" | "HTMLSelectElement"
  property?: "value" | "checked"
}

const getWindow = (el: HTMLElement) => el.ownerDocument.defaultView || window

function getDescriptor(el: HTMLElement, options: DescriptorOptions) {
  const { type = "HTMLInputElement", property = "value" } = options
  const proto = getWindow(el)[type].prototype
  return Object.getOwnPropertyDescriptor(proto, property) ?? {}
}

export function setElementValue(el: HTMLElement, value: string, option: DescriptorOptions = {}) {
  const descriptor = getDescriptor(el, option)
  descriptor.set?.call(el, value)
  el.setAttribute("value", value)
}

export function setElementChecked(el: HTMLElement, checked: boolean) {
  const descriptor = getDescriptor(el, { type: "HTMLInputElement", property: "checked" })
  descriptor.set?.call(el, checked)
  // react applies the `checked` automatically when we call the descriptor
  // but for consistency with vanilla JS, we need to do it manually as well
  if (checked) el.setAttribute("checked", "")
  else el.removeAttribute("checked")
}

export type InputEventOptions = {
  value: string | number
  bubbles?: boolean
}

export function dispatchInputValueEvent(el: HTMLElement | null, options: InputEventOptions) {
  const { value, bubbles = true } = options

  if (!el) return

  const win = getWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  setElementValue(el, `${value}`)
  el.dispatchEvent(new win.Event("input", { bubbles }))
}

export type CheckedEventOptions = {
  checked: boolean
  bubbles?: boolean
}

export function dispatchInputCheckedEvent(el: HTMLElement | null, options: CheckedEventOptions) {
  const { checked, bubbles = true } = options

  if (!el) return

  const win = getWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  setElementChecked(el, checked)
  el.dispatchEvent(new win.Event("click", { bubbles }))
}
