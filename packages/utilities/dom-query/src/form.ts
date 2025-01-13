import { getWindow } from "./node"

interface DescriptorOptions {
  type?: "HTMLInputElement" | "HTMLTextAreaElement" | "HTMLSelectElement" | undefined
  property?: "value" | "checked" | undefined
}

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

export interface InputValueEventOptions {
  value: string | number
  bubbles?: boolean
}

export function dispatchInputValueEvent(el: HTMLElement | null, options: InputValueEventOptions) {
  const { value, bubbles = true } = options

  if (!el) return

  const win = getWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  setElementValue(el, `${value}`)
  el.dispatchEvent(new win.Event("input", { bubbles }))
}

export interface CheckedEventOptions {
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

function getClosestForm(el: HTMLElement) {
  return isFormElement(el) ? el.form : el.closest("form")
}

function isFormElement(el: HTMLElement): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return el.matches("textarea, input, select, button")
}

function trackFormReset(el: HTMLElement | null | undefined, callback: () => void) {
  if (!el) return
  const form = getClosestForm(el)
  const onReset = (e: Event) => {
    if (e.defaultPrevented) return
    callback()
  }
  form?.addEventListener("reset", onReset, { passive: true })
  return () => form?.removeEventListener("reset", onReset)
}

function trackFieldsetDisabled(el: HTMLElement | null | undefined, callback: (disabled: boolean) => void) {
  const fieldset = el?.closest("fieldset")
  if (!fieldset) return
  callback(fieldset.disabled)
  const win = getWindow(fieldset)
  const obs = new win.MutationObserver(() => callback(fieldset.disabled))
  obs.observe(fieldset, {
    attributes: true,
    attributeFilter: ["disabled"],
  })
  return () => obs.disconnect()
}

export interface TrackFormControlOptions {
  onFieldsetDisabledChange: (disabled: boolean) => void
  onFormReset: () => void
}

export function trackFormControl(el: HTMLElement | null, options: TrackFormControlOptions) {
  if (!el) return
  const { onFieldsetDisabledChange, onFormReset } = options
  const cleanups = [trackFormReset(el, onFormReset), trackFieldsetDisabled(el, onFieldsetDisabledChange)]
  return () => cleanups.forEach((cleanup) => cleanup?.())
}
