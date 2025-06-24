import { getDocument, raf } from "@zag-js/dom-query"
import { FocusTrap } from "./focus-trap"
import type { FocusTrapOptions } from "./types"

type ElementOrGetter = HTMLElement | null | (() => HTMLElement | null)

export interface TrapFocusOptions extends Omit<FocusTrapOptions, "document"> {}

export function trapFocus(el: ElementOrGetter, options: TrapFocusOptions = {}) {
  let trap: FocusTrap | undefined
  const cleanup = raf(() => {
    const contentEl = typeof el === "function" ? el() : el
    if (!contentEl) return

    trap = new FocusTrap(contentEl, {
      escapeDeactivates: false,
      allowOutsideClick: true,
      preventScroll: true,
      returnFocusOnDeactivate: true,
      delayInitialFocus: false,
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
    cleanup()
  }
}

export { FocusTrap, type FocusTrapOptions }
