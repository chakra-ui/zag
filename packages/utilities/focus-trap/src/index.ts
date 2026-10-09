import { getDocument, whenNode } from "@zag-js/dom-query"
import { FocusTrap } from "./focus-trap"
import type { FocusTrapOptions } from "./types"

type ElementOrGetter = HTMLElement | null | (() => HTMLElement | null)
type ElementsOrGetter = ElementOrGetter | ElementOrGetter[]

export interface TrapFocusOptions extends Omit<FocusTrapOptions, "document"> {}

export function trapFocus(el: ElementsOrGetter, options: TrapFocusOptions = {}) {
  let trap: FocusTrap | undefined
  const elements = Array.isArray(el) ? el : [el]
  const resolveElements = () =>
    elements.map((e) => (typeof e === "function" ? e() : e)).filter((e): e is HTMLElement => e != null)

  const cleanup = whenNode(
    () => resolveElements()[0] ?? null,
    (primaryEl) => {
      const resolvedElements = resolveElements()

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
    },
    { defer: true, frame: true },
  )

  return function destroy() {
    trap?.deactivate()
    cleanup()
  }
}

export { FocusTrap, type FocusTrapOptions }
