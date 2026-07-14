import { getDocument, isHTMLElement, setStyle, waitForElement } from "@zag-js/dom-query"
import { layerStack } from "./layer-stack"

const originalBodyPointerEvents = new WeakMap<HTMLElement, string>()

export function disablePointerEventsOutside(node: HTMLElement, persistentElements?: Array<() => Element | null>) {
  const doc = getDocument(node)

  const cleanups: VoidFunction[] = []

  if (layerStack.hasPointerBlockingLayer() && !doc.body.hasAttribute("data-inert")) {
    originalBodyPointerEvents.set(doc.body, doc.body.style.pointerEvents)
    queueMicrotask(() => {
      const body = doc.body
      if (!body) return
      body.style.pointerEvents = "none"
      body.setAttribute("data-inert", "")
    })
  }

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
    if (layerStack.hasPointerBlockingLayer()) return
    queueMicrotask(() => {
      const body = doc.body
      if (!body) return
      const original = originalBodyPointerEvents.get(body)
      if (original !== undefined) {
        body.style.pointerEvents = original
        originalBodyPointerEvents.delete(body)
      }
      body.removeAttribute("data-inert")
      if (body.style.length === 0) body.removeAttribute("style")
    })
    cleanups.forEach((fn) => fn())
  }
}
