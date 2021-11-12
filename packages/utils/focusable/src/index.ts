import { checkElementStyle } from "./computed-style"
import { isElement } from "./guard"

export function isHidden(el: HTMLElement | null, until?: HTMLElement) {
  if (!el || checkElementStyle(el, "visibility", "hidden")) return true
  while (el) {
    if (until != null && el === until) return false
    if (checkElementStyle(el, "display", "none")) return true
    el = el.parentElement
  }
  return false
}

export const isDisabled = (el: HTMLElement | null): boolean => {
  return el?.getAttribute("disabled") != null || !!el?.getAttribute("aria-disabled") === true
}

/**
 * Returns the focusable elements within the element
 */
export const getFocusables = (el: HTMLElement | null, includeContainer = false) => {
  if (!el) return []
  let els = Array.from(el.querySelectorAll<HTMLElement>(focusableSelector))
  if (includeContainer) els.unshift(el)
  return els.filter((el) => isFocusable(el) && !isHidden(el))
}

/**
 * Whether this element is focusable
 */
export const isFocusable = (el: HTMLElement | null) => {
  if (!isElement(el) || isHidden(el) || isDisabled(el)) return false
  return el?.matches(focusableSelector)
}

export const focusableSelector = [
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "embed",
  "iframe",
  "object",
  "a[href]",
  "area[href]",
  "[tabindex]",
  "audio[controls]",
  "video[controls]",
  "*[tabindex]:not([aria-disabled])",
  "[contenteditable]:not([contenteditable=false])",
  "details > summary:first-of-type",
].join(",")
