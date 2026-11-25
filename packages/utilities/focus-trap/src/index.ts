import { getDocument, isElementVisible, raf, whenNode } from "@zag-js/dom-query"
import { FocusTrap } from "./focus-trap"
import type { FocusTrapOptions } from "./types"

type ElementOrGetter = HTMLElement | null | (() => HTMLElement | null)
type ElementsOrGetter = ElementOrGetter | ElementOrGetter[]

export interface TrapFocusOptions extends Omit<FocusTrapOptions, "document"> {
  /**
   * The root the node is queried from, observed while the node is deferred
   */
  getRootNode?: (() => Node) | undefined
}

export function trapFocus(el: ElementsOrGetter, options: TrapFocusOptions = {}) {
  const { getRootNode, ...trapOptions } = options
  const elements = Array.isArray(el) ? el : [el]
  const resolve = (e: ElementOrGetter) => (typeof e === "function" ? e() : e)

  let trap: FocusTrap | undefined
  const activate = () => {
    const resolvedElements = elements.map(resolve).filter((e): e is HTMLElement => e != null)

    if (resolvedElements.length === 0) return

    const primaryEl = resolvedElements[0]

    trap = new FocusTrap(resolvedElements, {
      escapeDeactivates: false,
      allowOutsideClick: true,
      preventScroll: true,
      returnFocusOnDeactivate: true,
      delayInitialFocus: false,
      fallbackFocus: primaryEl,
      ...trapOptions,
      document: getDocument(primaryEl),
    })

    try {
      trap.activate()
    } catch {}
  }

  const cleanup = whenNode(
    () => resolve(elements[0]),
    (node) => (isElementVisible(node) ? activate() : raf(activate)),
    { defer: true, getRootNode },
  )

  return function destroy() {
    trap?.deactivate()
    cleanup()
  }
}

export { FocusTrap, type FocusTrapOptions }
