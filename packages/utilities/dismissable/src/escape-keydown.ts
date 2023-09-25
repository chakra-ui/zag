import { addDomEvent } from "@zag-js/dom-event"
import { getDocument } from "@zag-js/dom-query"

export function trackEscapeKeydown(node: HTMLElement, fn?: (event: KeyboardEvent) => void) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") fn?.(event)
  }
  return addDomEvent(getDocument(node), "keydown", handleKeyDown)
}
