import { addDomEvent, contains } from "@zag-js/dom-utils"
import { callAll } from "@zag-js/utils"
import type { FocusContext } from "./focus-context"

export function focusOutsideEffect(ctx: FocusContext) {
  const { node, focusScope, doc } = ctx

  let lastFocusedElement: HTMLElement | null = null

  function onFocusin(event: FocusEvent) {
    if (ctx.focusScope.paused) return
    const target = event.target as HTMLElement | null
    if (contains(node, target)) {
      lastFocusedElement = target
    } else {
      lastFocusedElement?.focus({ preventScroll: true })
    }
  }

  function onFocusout(event: FocusEvent) {
    if (focusScope.paused) return
    const target = event.relatedTarget ?? doc.activeElement
    if (!contains(node, target)) {
      lastFocusedElement?.focus({ preventScroll: true })
    }
  }

  return callAll(addDomEvent(doc, "focusin", onFocusin), addDomEvent(doc, "focusout", onFocusout))
}
