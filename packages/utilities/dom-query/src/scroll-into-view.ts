import { isOverflowElement } from "./is-overflow-element"

export interface ScrollOptions extends ScrollIntoViewOptions {
  rootEl: HTMLElement | null
}

function isScrollable(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
}

export function scrollIntoView(el: HTMLElement | null | undefined, options?: ScrollOptions): void {
  const { rootEl, ...scrollOptions } = options || {}

  if (!el || !rootEl) {
    return
  }

  if (!isOverflowElement(rootEl) || !isScrollable(rootEl)) {
    return
  }

  el.scrollIntoView(scrollOptions)
}
