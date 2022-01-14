import { getOwnerWindow } from "./query"

export function dispatchInputEvent(input: HTMLElement, value: string | number) {
  const win = getOwnerWindow(input)
  if (!(input instanceof win.HTMLInputElement)) return

  input.type = "text"
  input.hidden = true

  const set = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value")?.set

  set?.call(input, value)

  const evt = new win.Event("input", { bubbles: true })
  input.dispatchEvent(evt)

  input.type = "hidden"
  input.hidden = false
}
