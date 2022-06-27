import { getComputedStyle } from "./get-computed-style"
import { isDisabled, isHTMLElement } from "./query"

export const focusableSelector = /*#__PURE__*/ [
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

export function isHidden(el: HTMLElement | null, until?: HTMLElement) {
  const style = getComputedStyle(el)
  if (!el || style.getPropertyValue("visibility") === "hidden") return true
  while (el) {
    if (until != null && el === until) return false
    if (style.getPropertyValue("display") === "none") return true
    el = el.parentElement
  }
  return false
}

/**
 * Returns the focusable elements within the element
 */
export const getFocusables = (el: HTMLElement | Document | null, includeContainer: boolean | "if-empty" = false) => {
  if (!el) return []
  let els = Array.from(el.querySelectorAll<HTMLElement>(focusableSelector))

  const shouldAddContainer = includeContainer == true || (includeContainer == "if-empty" && els.length === 0)

  if (shouldAddContainer && isHTMLElement(el)) {
    els.unshift(el)
  }

  return els.filter((el) => isFocusable(el) && !isHidden(el))
}

/**
 * Whether this element is focusable
 */
export const isFocusable = (el: HTMLElement | null) => {
  if (!isHTMLElement(el) || isHidden(el) || isDisabled(el)) return false
  return el?.matches(focusableSelector)
}

/**
 * Returns the tabbable elements within the element
 */
export const getTabbables = (el: HTMLElement | Document | null, includeContainer: boolean | "if-empty" = false) => {
  if (!el) return []
  return getFocusables(el, includeContainer).filter(isTabbable)
}

/**
 * Whether this element is tabbable
 */
export const isTabbable = (el: HTMLElement | null) => {
  return isFocusable(el) && !isDisabled(el) && !isHidden(el)
}
