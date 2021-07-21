import { cast } from "./function"

type DOMNode = HTMLElement | EventTarget | null

export function isHTMLElement(el: unknown): el is HTMLElement {
  return el instanceof HTMLElement
}

export function isSelectableInput(el: unknown): el is HTMLInputElement {
  return el instanceof HTMLInputElement && "select" in el
}

export function contains(parent: DOMNode | undefined, child: DOMNode) {
  if (!parent) return false
  return (
    parent === child ||
    (isHTMLElement(parent) && isHTMLElement(child) && parent.contains(child))
  )
}

export function isHidden(
  node: HTMLElement | null | undefined,
  { until }: { until?: HTMLElement | null } = {},
) {
  if (!node || getComputedStyle(node).visibility === "hidden") return true

  while (node) {
    if (until != null && node === until) return false
    if (getComputedStyle(node).display === "none") return true
    node = node.parentElement
  }

  return false
}

const focusableElements = [
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
  "*[contenteditable]",
]

const FOCUSABLE_ELEMENT_SELECTOR = focusableElements.join()

export class DOMHelper {
  constructor(public el: HTMLElement | null | undefined) {}

  attr = (value: string) => {
    return this.el?.getAttribute(value)
  }

  has = (value: string) => {
    return this.el?.hasAttribute(value)
  }

  $ = <T extends HTMLElement>(selector: string) => {
    return this.el?.querySelector<T>(selector)
  }

  $$ = <T extends HTMLElement>(selector: string) => {
    return Array.from(this.el?.querySelectorAll<T>(selector) ?? [])
  }

  getFocusables = (includeContainer = false) => {
    if (!this.el) return []

    let els = this.$$(FOCUSABLE_ELEMENT_SELECTOR)

    if (includeContainer) {
      els.unshift(this.el)
    }

    els = els.filter((el) => {
      const query = domHelper(el)
      return query.isFocusable && !query.isHidden
    })

    return els
  }

  getTabbables = (includeContainer = false) => {
    return this.getFocusables(includeContainer).filter((el) => {
      return domHelper(el).isTabbable
    })
  }

  get hasDisplayNone() {
    if (!this.el) return false
    return this.win.getComputedStyle(this.el).display === "none"
  }

  get hasTabIndex() {
    return this.el?.hasAttribute("tabindex")
  }

  get hasNegativeTabIndex() {
    if (!this.el) return false
    return this.hasTabIndex && this.el.tabIndex < 0
  }

  get isDisabled() {
    return (
      !!this.attr("disabled") === true || !!this.attr("aria-disabled") === true
    )
  }

  get isHidden() {
    return isHidden(this.el)
  }

  get isContentEditable() {
    return this.el?.isContentEditable
  }

  get isFocusable() {
    if (!isHTMLElement(this.el) || this.isHidden || this.isDisabled) {
      return false
    }
    return this.el?.matches(FOCUSABLE_ELEMENT_SELECTOR)
  }

  get isTabbable() {
    return this.isFocusable && !this.isDisabled && !this.isHidden
  }

  get doc() {
    return this.el?.ownerDocument ?? document
  }

  get win() {
    return this.el?.ownerDocument.defaultView ?? window
  }

  contains = (node: DOMNode) => {
    return contains(this.el, node)
  }

  get isActiveElement() {
    return this.doc.activeElement === this.el
  }

  get tagName() {
    return this.el?.tagName.toLowerCase()
  }

  get parent() {
    return this.el?.parentElement
  }

  /**
   *  Cache the element's computed style.
   *
   *  The returned style is a live CSSStyleDeclaration object,
   *  which updates automatically when the element's styles are changed.
   *
   * @see MDN https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
   */
  private _computedStyleCache: CSSStyleDeclaration | null = null

  get computedStyle() {
    if (!this.el) return {} as CSSStyleDeclaration

    if (!this._computedStyleCache) {
      this._computedStyleCache = this.win.getComputedStyle(this.el)
    }

    return this._computedStyleCache
  }

  css(property: string) {
    return this.computedStyle?.getPropertyValue(property)
  }
}

export const domHelper = (el: HTMLElement) => {
  return new DOMHelper(el)
}

export const dataAttr = (condition: boolean | undefined) =>
  cast<boolean | "true" | "false">(condition ? "" : undefined)

export const ariaAttr = (condition: boolean | undefined) =>
  condition ? true : undefined
