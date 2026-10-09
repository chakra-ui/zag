import { getDocument, raf } from "@zag-js/dom-query"
import { FocusTrap } from "./focus-trap"
import type { FocusTrapOptions } from "./types"

type ElementOrGetter = HTMLElement | null | (() => HTMLElement | null)
type ElementsOrGetter = ElementOrGetter | ElementOrGetter[]

export interface TrapFocusOptions extends Omit<FocusTrapOptions, "document"> {}

export function trapFocus(el: ElementsOrGetter, options: TrapFocusOptions = {}) {
  let trap: FocusTrap | undefined
  const cleanup = raf(() => {
    const elements = Array.isArray(el) ? el : [el]
    const resolvedElements = elements
      .map((e) => (typeof e === "function" ? e() : e))
      .filter((e): e is HTMLElement => e != null)

    if (resolvedElements.length === 0) return

    const primaryEl = resolvedElements[0]

    trap = new FocusTrap(resolvedElements, {
      escapeDeactivates: false,
      allowOutsideClick: true,
      preventScroll: true,
      returnFocusOnDeactivate: true,
      delayInitialFocus: false,
      fallbackFocus: primaryEl,
      ...options,
      document: getDocument(primaryEl),
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
