import { addDomEvent, setVisuallyHidden } from "@zag-js/dom-utils"
import type { FocusContext } from "./focus-context"

export type FocusContainmentOptions = {
  loop?: boolean
}

export function focusContainmentEffect(ctx: FocusContext, options: FocusContainmentOptions = {}) {
  const { doc, win, focusScope, firstTabbable, lastTabbable, node } = ctx

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

  const removeStartFocusin = addDomEvent(startSentinel, "focusin", onFocus)
  const removeEndFocusin = addDomEvent(endSentinel, "focusin", onFocus)

  const obs = new win.MutationObserver((changes) => {
    for (const change of changes) {
      if (change.previousSibling === endSentinel) {
        endSentinel.remove()
        node.insertAdjacentElement("beforeend", endSentinel)
      }

      if (change.nextSibling === startSentinel) {
        startSentinel.remove()
        node.insertAdjacentElement("afterbegin", startSentinel)
      }
    }
  })

  obs.observe(node, { childList: true, subtree: false })

  return () => {
    startSentinel.remove()
    endSentinel.remove()
    removeStartFocusin()
    removeEndFocusin()
    obs.disconnect()
  }
}
