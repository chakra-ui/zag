type DOMNode = HTMLElement | EventTarget | null

export class DOMElement {
  constructor(public el: HTMLElement) {}

  static is(el: unknown): el is HTMLElement {
    return el instanceof HTMLElement
  }

  static isSelectableInput(el: unknown): el is HTMLInputElement {
    return el instanceof HTMLInputElement && "select" in el
  }

  static contains(parent: DOMNode, child: DOMNode) {
    if (!parent) return false
    return (
      parent === child ||
      (DOMElement.is(parent) && DOMElement.is(child) && parent.contains(child))
    )
  }

  attr(value: string) {
    return this.el.getAttribute(value)
  }

  $<T extends HTMLElement>(selector: string) {
    return this.el.querySelector<T>(selector)
  }

  $$<T extends HTMLElement>(selector: string) {
    return this.el.querySelectorAll<T>(selector)
  }

  get hasDisplayNone() {
    return this.ownerWindow?.getComputedStyle(this.el).display === "none"
  }

  get hasTabIndex() {
    return this.el.hasAttribute("tabindex")
  }

  get hasNegativeTabIndex() {
    return this.hasTabIndex && this.el.tabIndex < 0
  }

  get isDisabled() {
    return (
      !!this.attr("disabled") === true || !!this.attr("aria-disabled") === true
    )
  }

  get isHidden() {
    return this.el.offsetParent === null
  }

  get isContentEditable() {
    return this.el.isContentEditable
  }

  get isFocusable() {
    return this.el.tabIndex >= 0
  }

  get isTabbable() {
    return this.isFocusable && !this.isDisabled && !this.isHidden
  }

  get ownerDocument() {
    return this.el.ownerDocument
  }

  get ownerWindow() {
    return this.el.ownerDocument.defaultView
  }

  contains(node: DOMNode) {
    return DOMElement.contains(this.el, node)
  }

  get isFocused() {
    return this.ownerDocument.activeElement === this.el
  }

  get tag() {
    return this.el.tagName.toLowerCase()
  }

  get isSelectable() {
    return DOMElement.isSelectableInput(this.el)
  }

  focus(options: FocusOptions) {
    const { preventScroll = true, select } = options
    if (this.isDisabled || !this.el.focus) return
    const prevFocusedEl = this.ownerDocument.activeElement
    this.el.focus({ preventScroll })
    if (this.el !== prevFocusedEl && this.isSelectable && select) {
      // @ts-ignore
      this.el.select()
    }
  }
}

type FocusOptions = {
  select: boolean
  preventScroll?: boolean
}
