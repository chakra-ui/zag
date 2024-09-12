import { nextTick, getDocument } from "@zag-js/dom-query"
import { createFocusTrap, type FocusTrap, type Options } from "focus-trap"

type ElementOrGetter = HTMLElement | null | (() => HTMLElement | null)

export interface TrapFocusOptions extends Omit<Options, "document"> {}

export function trapFocus(el: ElementOrGetter, options: TrapFocusOptions = {}) {
  let trap: FocusTrap | undefined
  nextTick(() => {
    const contentEl = typeof el === "function" ? el() : el
    if (!contentEl) return
    trap = createFocusTrap(contentEl, {
      escapeDeactivates: false,
      allowOutsideClick: true,
      preventScroll: true,
      returnFocusOnDeactivate: true,
      document: getDocument(contentEl),
      fallbackFocus: contentEl,
      ...options,
    })

    try {
      trap.activate()
    } catch {}
  })

  return function destroy() {
    trap?.deactivate()
  }
}
