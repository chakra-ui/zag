import { getWindow } from "./node"
import type { HTMLElementWithValue } from "./types"

interface DescriptorOptions {
  type?: "HTMLInputElement" | "HTMLTextAreaElement" | "HTMLSelectElement" | undefined
  property?: "value" | "checked" | undefined
}

function getDescriptor(el: HTMLElement, options: DescriptorOptions) {
  const { type = "HTMLInputElement", property = "value" } = options
  const proto = getWindow(el)[type].prototype
  return Object.getOwnPropertyDescriptor(proto, property) ?? {}
}

function getElementType(el: HTMLElementWithValue) {
  if (el.localName === "input") return "HTMLInputElement"
  if (el.localName === "textarea") return "HTMLTextAreaElement"
  if (el.localName === "select") return "HTMLSelectElement"
}

export function setElementValue(
  el: HTMLElementWithValue | null,
  value: string,
  property: "value" | "checked" = "value",
) {
  if (!el) return
  const type = getElementType(el)
  if (type) {
    const descriptor = getDescriptor(el, { type, property })
    descriptor.set?.call(el, value)
  }
  el.setAttribute(property, value)
}

export function setElementChecked(el: HTMLInputElement | null, checked: boolean) {
  if (!el) return
  const descriptor = getDescriptor(el, { type: "HTMLInputElement", property: "checked" })
  descriptor.set?.call(el, checked)
  // react applies the `checked` automatically when we call the descriptor
  // but for consistency with vanilla JS, we need to do it manually as well
  if (checked) el.setAttribute("checked", "")
  else el.removeAttribute("checked")
}

export interface InputValueEventOptions {
  value: string | number
  bubbles?: boolean | undefined
}

export function dispatchInputValueEvent(el: HTMLElementWithValue | null, options: InputValueEventOptions) {
  const { value, bubbles = true } = options

  if (!el) return

  const win = getWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  setElementValue(el, `${value}`)

  const event = new win.Event("input", { bubbles })
  el.dispatchEvent(markAsInternalChangeEvent(event))
}

export interface CheckedEventOptions {
  checked: boolean
  bubbles?: boolean | undefined
}

export function dispatchInputCheckedEvent(el: HTMLInputElement | null, options: CheckedEventOptions) {
  const { checked, bubbles = true } = options
  if (!el) return

  const win = getWindow(el)
  if (!(el instanceof win.HTMLInputElement)) return

  setElementChecked(el, checked)

  const event = new win.Event("click", { bubbles })
  el.dispatchEvent(markAsInternalChangeEvent(event))
}

function isFormElement(el: HTMLElement): el is HTMLElementWithValue {
  return el.matches("textarea, input, select, button")
}

function trackFormReset(el: HTMLElement | null | undefined, callback: VoidFunction) {
  if (!el) return
  const form = isFormElement(el) ? el.form : el.closest("form")
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
  onFormReset: VoidFunction
}

export function trackFormControl(el: HTMLElement | null, options: TrackFormControlOptions) {
  if (!el) return
  const { onFieldsetDisabledChange, onFormReset } = options
  const cleanups = [trackFormReset(el, onFormReset), trackFieldsetDisabled(el, onFieldsetDisabledChange)]
  return () => cleanups.forEach((cleanup) => cleanup?.())
}

//////////////// INTERNAL CHANGE EVENT ////////////////

const INTERNAL_CHANGE_EVENT = Symbol.for("zag.changeEvent")

type InternalChangeEventProps = { [INTERNAL_CHANGE_EVENT]?: boolean }

export function isInternalChangeEvent<T extends Event>(e: T): e is T & InternalChangeEventProps {
  return Object.prototype.hasOwnProperty.call(e, INTERNAL_CHANGE_EVENT)
}

export function markAsInternalChangeEvent<T extends Event>(event: T): T & InternalChangeEventProps {
  if (isInternalChangeEvent(event)) return event
  Object.defineProperty(event, INTERNAL_CHANGE_EVENT, { value: true })
  return event
}
