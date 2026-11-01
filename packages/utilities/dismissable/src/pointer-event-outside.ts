import { getDocument, isHTMLElement, setStyle, waitForElement } from "@zag-js/dom-query"
import { layerStack } from "./layer-stack"

const originalBodyPointerEvents = new WeakMap<HTMLElement, string>()

const scheduled = new WeakSet<Document>()

/** Applies or restores body blocking from the current stack state, once per microtask. */
function syncBodyPointerEvents(doc: Document) {
  if (scheduled.has(doc)) return
  scheduled.add(doc)
  queueMicrotask(() => {
    scheduled.delete(doc)
    const body = doc.body
    if (!body) return

    const shouldBlock = layerStack.hasPointerBlockingLayer()
    if (shouldBlock === body.hasAttribute("data-inert")) return

    if (shouldBlock) {
      originalBodyPointerEvents.set(body, body.style.pointerEvents)
      body.style.pointerEvents = "none"
      body.setAttribute("data-inert", "")
      return
    }

    const original = originalBodyPointerEvents.get(body)
    if (original !== undefined) {
      body.style.pointerEvents = original
      originalBodyPointerEvents.delete(body)
    }
    body.removeAttribute("data-inert")
    if (body.style.length === 0) body.removeAttribute("style")
  })
}

/**
 * Re-derives pointer blocking from the stack. Needed after a layer's `pointerBlocking` getter
 * changes value, since nothing was added or removed to trigger the usual sync.
 */
export function syncPointerEvents(node: HTMLElement) {
  syncBodyPointerEvents(getDocument(node))
}

export function disablePointerEventsOutside(node: HTMLElement, persistentElements?: Array<() => Element | null>) {
  const doc = getDocument(node)

  const cleanups: VoidFunction[] = []

  syncBodyPointerEvents(doc)

  persistentElements?.forEach((el) => {
    const [promise, abort] = waitForElement(
      () => {
        const node = el()
        return isHTMLElement(node) ? node : null
      },
      { timeout: 1000 },
    )
    promise.then((el) => cleanups.push(setStyle(el, { pointerEvents: "auto" })))
    cleanups.push(abort)
  })

  return () => {
    syncBodyPointerEvents(doc)
    cleanups.forEach((fn) => fn())
  }
}
