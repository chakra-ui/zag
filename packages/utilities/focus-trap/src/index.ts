import { getDocument, raf } from "@zag-js/dom-query"
import { createFocusTrap, type FocusTrap, type Options } from "focus-trap"

type ElementOrGetter = HTMLElement | null | (() => HTMLElement | null)

export interface TrapFocusOptions extends Omit<Options, "document"> {}

export function trapFocus(el: ElementOrGetter, options: TrapFocusOptions = {}) {
  let trap: FocusTrap | undefined

  raf(() => {
    const contentEl = typeof el === "function" ? el() : el
    if (!contentEl) return
    trap = createFocusTrap(contentEl, {
      delayInitialFocus: false,
      escapeDeactivates: false,
      allowOutsideClick: true,
      preventScroll: true,
      returnFocusOnDeactivate: true,
      fallbackFocus: contentEl,
      ...options,
      document: getDocument(contentEl),
    })

    try {
      trap.activate()
    } catch {}
  })

  return function destroy() {
    trap?.deactivate()
  }
}

export type { FocusTrap }
