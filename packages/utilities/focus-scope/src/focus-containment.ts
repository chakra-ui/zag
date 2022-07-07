import { addDomEvent, setVisuallyHidden } from "@zag-js/dom-utils"
import { callAll } from "@zag-js/utils"
import type { FocusContext } from "./focus-context"

export type FocusContainmentOptions = {
  loop?: boolean
}

export function focusContainmentEffect(ctx: FocusContext, options: FocusContainmentOptions = {}) {
  const { doc, focusScope, firstTabbable, lastTabbable, node } = ctx

  function createSentinel() {
    const element = doc.createElement("span")
    element.setAttribute("data-focus-trap", "")
    element.tabIndex = 0
    setVisuallyHidden(element)
    return element
  }

  const startSentinel = createSentinel()
  node.insertAdjacentElement("afterbegin", startSentinel)

  const endSentinel = createSentinel()
  node.insertAdjacentElement("beforeend", endSentinel)

  function onFocus(event: FocusEvent) {
    if (!options.loop || focusScope.paused) return

    const first = firstTabbable()
    const last = lastTabbable()
    if (event.relatedTarget === first) {
      last?.focus()
    } else {
      first?.focus()
    }
  }

  const removeFocusin = addDomEvent(startSentinel, "focusin", onFocus)
  const removeFocusout = addDomEvent(endSentinel, "focusin", onFocus)

  return () => {
    startSentinel.remove()
    endSentinel.remove()
    callAll(removeFocusin, removeFocusout)
  }
}
